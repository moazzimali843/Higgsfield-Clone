#!/usr/bin/env python3
"""Append-only Cursor session logs for the capture gate.

Events: sessionStart, beforeSubmitPrompt, afterAgentResponse, stop.
Thinking (afterAgentThought) is not hooked. beforeSubmitPrompt always
prints {"continue": true}. failClosed stays false in hooks.json.
"""

from __future__ import annotations

import fcntl
import json
import os
import re
import sys
import traceback
from datetime import datetime
from pathlib import Path

FALLBACK_MODEL = "grok-4.7"
TOOL_NAME = "Cursor IDE Agent"

HEADER_KEYS = [
    "session_id",
    "date",
    "author",
    "model",
    "model_id",
    "model_source",
    "tool",
    "project",
    "exchange_count",
    "first_prompt_time",
    "last_prompt_time",
    "observed_fields_sessionStart",
    "observed_fields_beforeSubmitPrompt",
    "observed_fields_afterAgentResponse",
    "observed_fields_stop",
]


def project_dir() -> Path:
    raw = os.environ.get("CURSOR_PROJECT_DIR") or os.getcwd()
    return Path(raw).resolve()


def logs_dir() -> Path:
    return project_dir() / ".agent-logs"


def state_dir() -> Path:
    path = project_dir() / ".cursor" / "hooks" / "state"
    path.mkdir(parents=True, exist_ok=True)
    return path


def now_local() -> datetime:
    return datetime.now().astimezone()


def iso(moment: datetime) -> str:
    return moment.isoformat(timespec="seconds")


def yaml_unquote(quoted: str) -> str:
    inner = quoted[1:-1]
    out: list[str] = []
    index = 0
    while index < len(inner):
        if inner[index] == "\\" and index + 1 < len(inner):
            code = inner[index + 1]
            mapping = {"n": "\n", "r": "\r", '"': '"', "\\": "\\"}
            out.append(mapping.get(code, code))
            index += 2
            continue
        out.append(inner[index])
        index += 1
    return "".join(out)


def yaml_quote(value: str) -> str:
    escaped = (
        value.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
        .replace("\r", "\\r")
    )
    return f'"{escaped}"'


def safe_id(session_id: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]", "_", session_id).strip("._")
    return (cleaned or "unknown-session")[:80]


def read_stdin() -> str:
    return sys.stdin.read()


def parse_payload(raw: str) -> dict:
    if not raw.strip():
        return {}
    data = json.loads(raw)
    if not isinstance(data, dict):
        return {}
    return data


def event_name(payload: dict) -> str:
    from_payload = payload.get("hook_event_name")
    if isinstance(from_payload, str) and from_payload.strip():
        return from_payload.strip()
    if len(sys.argv) > 1 and sys.argv[1].strip():
        return sys.argv[1].strip()
    return ""


def session_id_of(payload: dict) -> str:
    for key in ("session_id", "conversation_id"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return "unknown-session"


def author_of(payload: dict) -> str:
    email = payload.get("user_email")
    if isinstance(email, str) and email.strip():
        return email.strip()
    env_email = os.environ.get("CURSOR_USER_EMAIL")
    if isinstance(env_email, str) and env_email.strip():
        return env_email.strip()
    return "unknown"


def payload_model(payload: dict) -> tuple[str, str]:
    for key in ("model", "model_id"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip(), "payload"
    return FALLBACK_MODEL, "fallback"


def model_id_of(payload: dict) -> str:
    value = payload.get("model_id")
    if isinstance(value, str) and value.strip():
        return value.strip()
    return ""


def field_list(payload: dict) -> str:
    return ",".join(sorted(str(key) for key in payload.keys()))


def find_session_file(session_id: str) -> Path | None:
    needle = f"_{safe_id(session_id)}.md"
    directory = logs_dir()
    if not directory.exists():
        return None
    matches = sorted(
        path for path in directory.glob("*.md") if path.name.endswith(needle)
    )
    if not matches:
        return None
    return matches[-1]


def new_session_path(session_id: str, moment: datetime) -> Path:
    directory = logs_dir()
    directory.mkdir(parents=True, exist_ok=True)
    stamp = moment.strftime("%Y-%m-%d_%H-%M-%S")
    return directory / f"{stamp}_{safe_id(session_id)}.md"


def blank_header(session_id: str, payload: dict, moment: datetime) -> dict[str, str]:
    model, source = payload_model(payload)
    return {
        "session_id": session_id,
        "date": moment.date().isoformat(),
        "author": author_of(payload),
        "model": model,
        "model_id": model_id_of(payload),
        "model_source": source,
        "tool": TOOL_NAME,
        "project": project_dir().name,
        "exchange_count": "0",
        "first_prompt_time": "",
        "last_prompt_time": "",
        "observed_fields_sessionStart": "",
        "observed_fields_beforeSubmitPrompt": "",
        "observed_fields_afterAgentResponse": "",
        "observed_fields_stop": "",
    }


def render_header(header: dict[str, str]) -> str:
    lines = ["---"]
    for key in HEADER_KEYS:
        value = header.get(key, "")
        if key == "exchange_count":
            lines.append(f"{key}: {int(value or '0')}")
        else:
            lines.append(f"{key}: {yaml_quote(value)}")
    lines.append("---")
    return "\n".join(lines) + "\n"


def split_document(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---\n"):
        raise ValueError("session log is missing frontmatter")
    end = text.find("\n---\n", 4)
    if end == -1:
        raise ValueError("session log frontmatter is not closed")
    raw_header = text[4:end]
    body = text[end + 5 :]
    header = {key: "" for key in HEADER_KEYS}
    for line in raw_header.split("\n"):
        if not line.strip() or ":" not in line:
            continue
        key, raw_value = line.split(":", 1)
        key = key.strip()
        raw_value = raw_value.strip()
        if key == "exchange_count":
            header[key] = raw_value or "0"
            continue
        if len(raw_value) >= 2 and raw_value[0] == '"' and raw_value[-1] == '"':
            header[key] = yaml_unquote(raw_value)
        else:
            header[key] = raw_value
    return header, body


def write_document(path: Path, header: dict[str, str], body: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(render_header(header) + body, encoding="utf-8")
    os.replace(temporary, path)


def load_document(path: Path) -> tuple[dict[str, str], str]:
    return split_document(path.read_text(encoding="utf-8"))


def ensure_session(payload: dict, moment: datetime) -> Path:
    session_id = session_id_of(payload)
    existing = find_session_file(session_id)
    if existing is not None:
        return existing
    path = new_session_path(session_id, moment)
    header = blank_header(session_id, payload, moment)
    body = "\n# Agent session\n\nAutomatic capture. Entry bodies are append-only.\n"
    write_document(path, header, body)
    return path


def note_fields(header: dict[str, str], event: str, payload: dict) -> None:
    key = f"observed_fields_{event}"
    if key not in header:
        return
    existing = [part for part in header.get(key, "").split(",") if part]
    incoming = [part for part in field_list(payload).split(",") if part]
    header[key] = ",".join(sorted(set(existing) | set(incoming)))


def note_model(header: dict[str, str], payload: dict) -> tuple[str, str]:
    model, source = payload_model(payload)
    if source == "payload":
        header["model"] = model
        header["model_source"] = "payload"
        model_id = model_id_of(payload)
        if model_id:
            header["model_id"] = model_id
        return model, source
    if not header.get("model"):
        header["model"] = FALLBACK_MODEL
        header["model_source"] = "fallback"
    return header.get("model") or FALLBACK_MODEL, header.get("model_source") or "fallback"


def pending_path(session_id: str) -> Path:
    return state_dir() / f"{safe_id(session_id)}.json"


def read_pending(session_id: str) -> dict | None:
    path = pending_path(session_id)
    if not path.exists():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        return None
    return data


def write_pending(session_id: str, data: dict) -> None:
    path = pending_path(session_id)
    temporary = path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(data), encoding="utf-8")
    os.replace(temporary, path)


def clear_pending(session_id: str) -> None:
    path = pending_path(session_id)
    if path.exists():
        path.unlink()


def prompt_text(payload: dict) -> str:
    value = payload.get("prompt")
    if isinstance(value, str):
        return value
    return ""


def response_text(payload: dict) -> str:
    value = payload.get("text")
    if isinstance(value, str):
        return value
    return ""


def locked(session_id: str):
    path = state_dir() / f"{safe_id(session_id)}.lock"
    handle = path.open("a", encoding="utf-8")
    fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
    return handle


def handle_session_start(payload: dict, moment: datetime) -> None:
    path = ensure_session(payload, moment)
    header, body = load_document(path)
    note_fields(header, "sessionStart", payload)
    note_model(header, payload)
    if not header.get("author") or header.get("author") == "unknown":
        header["author"] = author_of(payload)
    write_document(path, header, body)


def handle_prompt(payload: dict, moment: datetime) -> None:
    path = ensure_session(payload, moment)
    header, body = load_document(path)
    note_fields(header, "beforeSubmitPrompt", payload)
    model, source = note_model(header, payload)
    stamp = iso(moment)
    count = int(header.get("exchange_count") or "0") + 1
    header["exchange_count"] = str(count)
    if not header.get("first_prompt_time"):
        header["first_prompt_time"] = stamp
    header["last_prompt_time"] = stamp
    if not header.get("author") or header.get("author") == "unknown":
        header["author"] = author_of(payload)

    block = (
        f"\n## Exchange {count}\n\n"
        "### META\n"
        f"time: {stamp}\n"
        f"model: {model}\n"
        f"model_source: {source}\n"
        f"fields: {field_list(payload)}\n\n"
        "### PROMPT\n"
        f"{prompt_text(payload)}"
    )
    if not block.endswith("\n"):
        block += "\n"
    write_document(path, header, body + block)
    write_pending(
        session_id_of(payload),
        {
            "exchange": count,
            "text": None,
            "model": model,
            "model_source": source,
            "fields": "",
        },
    )


def handle_response(payload: dict, moment: datetime) -> None:
    session_id = session_id_of(payload)
    path = ensure_session(payload, moment)
    header, body = load_document(path)
    note_fields(header, "afterAgentResponse", payload)
    model, source = note_model(header, payload)
    write_document(path, header, body)
    pending = read_pending(session_id) or {"exchange": None}
    pending["text"] = response_text(payload)
    pending["model"] = model
    pending["model_source"] = source
    pending["fields"] = field_list(payload)
    generation_id = payload.get("generation_id")
    pending["generation_id"] = generation_id if isinstance(generation_id, str) else ""
    write_pending(session_id, pending)


def handle_stop(payload: dict, moment: datetime) -> None:
    session_id = session_id_of(payload)
    path = ensure_session(payload, moment)
    header, body = load_document(path)
    note_fields(header, "stop", payload)
    note_model(header, payload)
    pending = read_pending(session_id)
    status = payload.get("status")
    status_text = status.strip() if isinstance(status, str) and status.strip() else "unknown"

    if not pending or not isinstance(pending.get("exchange"), int):
        write_document(path, header, body)
        return

    text = pending.get("text")
    if not isinstance(text, str):
        text = "(no assistant text captured for this turn)"
        model = header.get("model") or FALLBACK_MODEL
        source = header.get("model_source") or "fallback"
        fields = field_list(payload)
    else:
        model = pending.get("model") if isinstance(pending.get("model"), str) else ""
        source = (
            pending.get("model_source")
            if isinstance(pending.get("model_source"), str)
            else ""
        )
        fields = pending.get("fields") if isinstance(pending.get("fields"), str) else ""
        if not model:
            model = header.get("model") or FALLBACK_MODEL
            source = header.get("model_source") or "fallback"

    block = (
        "\n### RESPONSE\n"
        f"status: {status_text}\n"
        f"model: {model}\n"
        f"model_source: {source}\n"
        f"fields: {fields}\n\n"
        f"{text}"
    )
    if not block.endswith("\n"):
        block += "\n"
    write_document(path, header, body + block)
    clear_pending(session_id)


def log_failure(message: str) -> None:
    try:
        path = state_dir() / "capture-errors.log"
        with path.open("a", encoding="utf-8") as handle:
            handle.write(f"[{iso(now_local())}] {message}\n")
    except Exception:
        sys.stderr.write(message + "\n")


def emit(event: str) -> None:
    if event == "beforeSubmitPrompt":
        sys.stdout.write(json.dumps({"continue": True}) + "\n")
    else:
        sys.stdout.write("{}\n")


def main() -> int:
    raw = read_stdin()
    event = sys.argv[1].strip() if len(sys.argv) > 1 else ""
    try:
        payload = parse_payload(raw)
        event = event_name(payload) or event
        moment = now_local()
        session_id = session_id_of(payload) if payload else "unknown-session"
        lock = locked(session_id)
        try:
            if event == "sessionStart":
                handle_session_start(payload, moment)
            elif event == "beforeSubmitPrompt":
                handle_prompt(payload, moment)
            elif event == "afterAgentResponse":
                handle_response(payload, moment)
            elif event == "stop":
                handle_stop(payload, moment)
            elif event:
                log_failure(f"ignored event {event}")
        finally:
            fcntl.flock(lock.fileno(), fcntl.LOCK_UN)
            lock.close()
    except Exception:
        log_failure(traceback.format_exc())
        try:
            with (state_dir() / "unparsed.log").open("a", encoding="utf-8") as handle:
                handle.write(raw[:4000] + "\n")
        except Exception:
            pass
    emit(event)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        sys.stdout.write('{"continue": true}\n')
        sys.exit(0)
