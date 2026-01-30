"use client";

import { useCallback, useState } from "react";
import { createWorker } from "tesseract.js";

const OCR_LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "vie", label: "Vietnamese" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "chi_tra", label: "Chinese (Traditional)" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "spa", label: "Spanish" },
  { code: "por", label: "Portuguese" },
  { code: "ita", label: "Italian" },
  { code: "rus", label: "Russian" },
  { code: "tha", label: "Thai" },
  { code: "ara", label: "Arabic" },
] as const;

interface ImageToTextProps {
  onTextExtracted: (text: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function ImageToText({
  onTextExtracted,
  onCancel,
  className = "",
}: ImageToTextProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("eng");

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      if (!f.type.startsWith("image/")) {
        setError("Please select an image file (PNG, JPG, etc.)");
        return;
      }
      setError(null);
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    },
    []
  );

  const handleExtract = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setError(null);
    try {
      const worker = await createWorker(language, 1, {
        logger: (m) => {
          if (m.status === "recognizing text" && m.progress) {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const {
        data: { text },
      } = await worker.recognize(file);
      await worker.terminate();
      const trimmed = text?.trim() || "";
      if (!trimmed) {
        setError("No text was found in the image.");
      } else {
        onTextExtracted(trimmed);
        setFile(null);
        setPreview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR failed");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [file, language, onTextExtracted]);

  const handleClear = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
    setProgress(0);
    onCancel?.();
  }, [onCancel]);

  return (
    <div className={`rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20 ${className}`}>
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <svg
          className="h-5 w-5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="font-medium">Image to Text (OCR)</span>
      </div>
      <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
        Upload an image of your prompt to extract text automatically
      </p>

      <div className="mt-3">
        <label className="mb-1.5 block text-xs font-medium text-amber-800 dark:text-amber-200">
          OCR Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-amber-700 dark:bg-zinc-900 dark:text-zinc-100 disabled:opacity-50"
        >
          {OCR_LANGUAGES.map(({ code, label }) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </div>

      {!preview ? (
        <label className="mt-3 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-amber-300 bg-white px-4 py-6 transition hover:border-amber-400 hover:bg-amber-50/50 dark:border-amber-700 dark:bg-zinc-900 dark:hover:border-amber-600 dark:hover:bg-amber-950/30">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <svg
            className="h-10 w-10 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-sm text-amber-700 dark:text-amber-300">
            Drop image or click to upload
          </span>
        </label>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="relative overflow-hidden rounded-lg border border-amber-200 bg-white dark:border-amber-800 dark:bg-zinc-900">
            <img
              src={preview}
              alt="Preview"
              className="max-h-40 w-full object-contain"
            />
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <div className="h-2 w-3/4 overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="mt-2 text-sm text-white">Extracting… {progress}%</span>
              </div>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExtract}
              disabled={loading}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? "Extracting…" : "Extract Text"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
