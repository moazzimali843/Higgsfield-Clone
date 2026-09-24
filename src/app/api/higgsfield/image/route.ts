import { NextResponse } from "next/server";
import { parseExcludeOutputUrls } from "@/lib/demo-image-job";
import { submitSoulV2ImageJob } from "@/lib/higgsfield-image-job";
import { REFERENCE_IMAGE_MAX_BYTES, REFERENCE_IMAGE_MAX_LABEL } from "@/lib/reference-image";
import {
  parseExcludeOutputUrlsField,
  parseSoulImageJobFields,
  referenceContentTypeFromFile,
} from "@/lib/higgsfield-request";

/** Pro plan can raise Vercel's ceiling; demo reviewers use `/api/demo/*` instead. */
export const maxDuration = 60;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Could not read multipart form data." },
        { status: 400 },
      );
    }

    const fields = parseSoulImageJobFields({
      prompt: form.get("prompt"),
      aspectRatio: form.get("aspectRatio"),
      apiKeyId: form.get("apiKeyId"),
      apiKeySecret: form.get("apiKeySecret"),
    });
    if (!fields.ok) {
      return NextResponse.json({ error: fields.error }, { status: 400 });
    }

    const referenceEntry = form.get("reference");
    let reference:
      | { bytes: Uint8Array; contentType: string; fileName: string }
      | undefined;

    if (referenceEntry instanceof File && referenceEntry.size > 0) {
      const mime = referenceContentTypeFromFile(referenceEntry);
      if (!mime) {
        return NextResponse.json(
          { error: "Reference must be a JPEG, PNG, or WebP image." },
          { status: 400 },
        );
      }
      if (referenceEntry.size > REFERENCE_IMAGE_MAX_BYTES) {
        return NextResponse.json(
          { error: `Reference image must be ${REFERENCE_IMAGE_MAX_LABEL} or smaller.` },
          { status: 400 },
        );
      }
      const buffer = new Uint8Array(await referenceEntry.arrayBuffer());
      reference = {
        bytes: buffer,
        contentType: mime,
        fileName: referenceEntry.name,
      };
    }

    const excludeOutputUrls = parseExcludeOutputUrlsField(
      form.get("excludeOutputUrls"),
    );

    const job = await submitSoulV2ImageJob({
      ...fields.value,
      reference,
      excludeOutputUrls,
      env: {
        HIGGSFIELD_KEY_ID: process.env.HIGGSFIELD_KEY_ID,
        HIGGSFIELD_KEY_SECRET: process.env.HIGGSFIELD_KEY_SECRET,
      },
    });
    if (!job.ok) {
      return NextResponse.json({ error: job.error }, { status: job.status });
    }
    return NextResponse.json(job.result);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = parseSoulImageJobFields(
    body && typeof body === "object" ? (body as Record<string, unknown>) : {},
  );
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const excludeOutputUrls = parseExcludeOutputUrls(record.excludeOutputUrls);

  const job = await submitSoulV2ImageJob({
    ...parsed.value,
    excludeOutputUrls,
    env: {
      HIGGSFIELD_KEY_ID: process.env.HIGGSFIELD_KEY_ID,
      HIGGSFIELD_KEY_SECRET: process.env.HIGGSFIELD_KEY_SECRET,
    },
  });
  if (!job.ok) {
    return NextResponse.json({ error: job.error }, { status: job.status });
  }
  return NextResponse.json(job.result);
}
