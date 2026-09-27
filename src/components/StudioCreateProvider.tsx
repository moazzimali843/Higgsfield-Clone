"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { StudioCreateBox } from "@/components/StudioCreateBox";
import {
  idleStudioImageJobState,
  StudioCreateImageResult,
  type StudioImageJobState,
} from "@/components/StudioCreateImageResult";
import {
  idleStudioVideoJobState,
  StudioCreateVideoResult,
  type StudioVideoJobState,
} from "@/components/StudioCreateVideoResult";
import {
  buildCreateHref,
  isCreatePromptValid,
  type CreateMode,
} from "@/lib/create-box-navigation";
import { isComingSoonHref } from "@/lib/navigation";
import {
  aspectRatioOptions,
  getComposerModelById,
  getVideoComposerModelById,
  type AspectRatio,
} from "@/lib/studio-recipe";
import {
  validateReferenceImageFile,
  type ReferenceImageAttachment,
} from "@/lib/reference-image";

function defaultAspectForMode(mode: CreateMode): AspectRatio {
  return mode === "video" ? "16:9" : "1:1";
}

type GenerateHandler = (() => void) | null;

type StudioCreateContextValue = {
  mode: CreateMode;
  prompt: string;
  modelId: string;
  aspectRatio: AspectRatio;
  imageJob: StudioImageJobState;
  videoJob: StudioVideoJobState;
  setMode: (mode: CreateMode) => void;
  setPrompt: (prompt: string) => void;
  setModelId: (modelId: string) => void;
  setAspectRatio: (aspectRatio: AspectRatio) => void;
  reference: ReferenceImageAttachment | null;
  referenceFile: File | null;
  referenceError: string | null;
  selectReferenceFiles: (fileList: FileList | null) => void;
  clearReference: () => void;
  registerImageGenerate: (handler: GenerateHandler) => void;
  registerVideoGenerate: (handler: GenerateHandler) => void;
  reportImageJobState: (state: StudioImageJobState) => void;
  reportVideoJobState: (state: StudioVideoJobState) => void;
  requestCreate: () => void;
};

const StudioCreateContext = createContext<StudioCreateContextValue | null>(
  null,
);

export function useStudioCreate(): StudioCreateContextValue {
  const value = useContext(StudioCreateContext);
  if (!value) {
    throw new Error("useStudioCreate must be used within StudioCreateProvider");
  }
  return value;
}

function StudioCreateBar() {
  const pathname = usePathname();
  const {
    mode,
    prompt,
    modelId,
    imageJob,
    videoJob,
    setMode,
    setPrompt,
    setModelId,
    aspectRatio,
    setAspectRatio,
    reference,
    referenceError,
    selectReferenceFiles,
    clearReference,
    requestCreate,
  } = useStudioCreate();

  const isHome = pathname === "/";
  const isImageComposer = pathname === "/image";
  const isVideoComposer = pathname === "/video";
  const isComingSoon =
    pathname !== null && isComingSoonHref(pathname);
  const isLibrary =
    pathname !== null &&
    (pathname === "/library" || pathname.startsWith("/library/"));

  if (isComingSoon || isLibrary) {
    return null;
  }
  const imageCreatePending = isImageComposer && imageJob.phase === "pending";
  const videoCreatePending = isVideoComposer && videoJob.phase === "pending";

  return (
    <div
      className="studio-create-bar -mx-4 mb-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 text-center">
        {isHome ? (
          <h1 className="studio-display w-full text-3xl font-semibold tracking-tight text-studio-fg sm:text-4xl lg:text-5xl">
            Create Images and Videos
          </h1>
        ) : null}
        <div className="w-full">
          <StudioCreateBox
            variant="compact"
            mode={mode}
            prompt={prompt}
            selectedModelId={modelId}
            aspectRatio={aspectRatio}
            reference={reference}
            referenceError={referenceError}
            onModeChange={setMode}
            onPromptChange={setPrompt}
            onModelChange={setModelId}
            onAspectRatioChange={setAspectRatio}
            onReferenceSelected={selectReferenceFiles}
            onReferenceClear={clearReference}
            onCreate={requestCreate}
            isSubmitting={imageCreatePending || videoCreatePending}
          />
        </div>
        {isImageComposer ? <StudioCreateImageResult state={imageJob} /> : null}
        {isVideoComposer ? <StudioCreateVideoResult state={videoJob} /> : null}
      </div>
    </div>
  );
}

export function StudioCreateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mode, setModeState] = useState<CreateMode>("image");
  const [prompt, setPrompt] = useState("");
  const [modelId, setModelId] = useState("demo");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [imageJob, setImageJob] = useState<StudioImageJobState>(
    idleStudioImageJobState,
  );
  const [videoJob, setVideoJob] = useState<StudioVideoJobState>(
    idleStudioVideoJobState,
  );
  const [reference, setReference] = useState<ReferenceImageAttachment | null>(
    null,
  );
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceError, setReferenceError] = useState<string | null>(null);

  const imageGenerateRef = useRef<GenerateHandler>(null);
  const videoGenerateRef = useRef<GenerateHandler>(null);

  const setMode = useCallback((next: CreateMode) => {
    setModeState(next);
    setModelId("demo");
    setAspectRatio(defaultAspectForMode(next));
  }, []);

  const registerImageGenerate = useCallback((handler: GenerateHandler) => {
    imageGenerateRef.current = handler;
  }, []);

  const registerVideoGenerate = useCallback((handler: GenerateHandler) => {
    videoGenerateRef.current = handler;
  }, []);

  const clearReference = useCallback(() => {
    if (reference?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(reference.previewUrl);
    }
    setReference(null);
    setReferenceFile(null);
    setReferenceError(null);
  }, [reference]);

  const selectReferenceFiles = useCallback(
    (fileList: FileList | null) => {
      const file = fileList?.[0];
      if (!file) return;
      const validation = validateReferenceImageFile(file);
      if (!validation.ok) {
        setReferenceError(validation.error);
        return;
      }
      if (reference?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(reference.previewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      setReference({ fileName: file.name, previewUrl });
      setReferenceFile(file);
      setReferenceError(null);
    },
    [reference],
  );

  useEffect(() => {
    return () => {
      if (reference?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(reference.previewUrl);
      }
    };
  }, [reference]);

  const reportImageJobState = useCallback((state: StudioImageJobState) => {
    setImageJob(state);
  }, []);

  const reportVideoJobState = useCallback((state: StudioVideoJobState) => {
    setVideoJob(state);
  }, []);

  useEffect(() => {
    if (pathname === "/image") {
      setModeState("image");
    } else if (pathname === "/video") {
      setModeState("video");
    }
  }, [pathname]);

  useEffect(() => {
    const promptParam = searchParams.get("prompt")?.trim();
    const modelParam = searchParams.get("modelId")?.trim();
    const aspectParam = searchParams.get("aspectRatio")?.trim();

    if (pathname === "/image") {
      if (promptParam) setPrompt(promptParam);
      if (modelParam && getComposerModelById(modelParam)) {
        setModelId(modelParam);
      }
      if (
        aspectParam &&
        aspectRatioOptions.includes(aspectParam as AspectRatio)
      ) {
        setAspectRatio(aspectParam as AspectRatio);
      }
      return;
    }

    if (pathname === "/video") {
      if (promptParam) setPrompt(promptParam);
      if (modelParam && getVideoComposerModelById(modelParam)) {
        setModelId(modelParam);
      }
      if (
        aspectParam &&
        aspectRatioOptions.includes(aspectParam as AspectRatio)
      ) {
        setAspectRatio(aspectParam as AspectRatio);
      }
    }
  }, [pathname, searchParams]);

  const requestCreate = useCallback(() => {
    if (!isCreatePromptValid(prompt)) return;

    if (mode === "image" && pathname === "/image" && imageGenerateRef.current) {
      imageGenerateRef.current();
      return;
    }
    if (mode === "video" && pathname === "/video" && videoGenerateRef.current) {
      videoGenerateRef.current();
      return;
    }

    const href = buildCreateHref({
      mode,
      prompt,
      modelId,
      aspectRatio,
      autorun: mode === "image",
    });
    if (href) router.push(href);
  }, [aspectRatio, mode, modelId, pathname, prompt, router]);

  const value = useMemo(
    (): StudioCreateContextValue => ({
      mode,
      prompt,
      modelId,
      aspectRatio,
      setMode,
      setPrompt,
      setModelId,
      setAspectRatio,
      reference,
      referenceFile,
      referenceError,
      selectReferenceFiles,
      clearReference,
      registerImageGenerate,
      registerVideoGenerate,
      reportImageJobState,
      reportVideoJobState,
      imageJob,
      videoJob,
      requestCreate,
    }),
    [
      aspectRatio,
      clearReference,
      imageJob,
      videoJob,
      mode,
      modelId,
      prompt,
      reference,
      referenceError,
      referenceFile,
      registerImageGenerate,
      registerVideoGenerate,
      reportImageJobState,
      reportVideoJobState,
      requestCreate,
      selectReferenceFiles,
      setMode,
    ],
  );

  return (
    <StudioCreateContext.Provider value={value}>
      <StudioCreateBar />
      {children}
    </StudioCreateContext.Provider>
  );
}
