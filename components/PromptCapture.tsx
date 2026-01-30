"use client";

import { useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { PromptEntry } from "@/lib/types";
import { savePrompt } from "@/lib/api";
import { ImageToText } from "./ImageToText";

interface PromptCaptureProps {
  onSaved?: (prompt: PromptEntry) => void;
  initialContent?: string;
}

const AI_TOOLS = [
  "Cursor",
  "ChatGPT",
  "Claude",
  "Copilot",
  "Gemini",
  "Other",
];

export function PromptCapture({
  onSaved,
  initialContent = "",
}: PromptCaptureProps) {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [aiTool, setAiTool] = useState("");
  const [useCase, setUseCase] = useState("");
  const [showImageOCR, setShowImageOCR] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fromImage, setFromImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const mdInputRef = useRef<HTMLInputElement>(null);

  const handleMdFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = (reader.result as string)?.trim() || "";
        if (text) {
          setContent((prev) => (prev ? prev + "\n\n" + text : text));
        }
      };
      reader.readAsText(f, "utf-8");
      e.target.value = "";
    },
    []
  );

  const handleSave = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    const entry: PromptEntry = {
      id: uuidv4(),
      content: trimmed,
      title: title.trim() || trimmed.slice(0, 60) + (trimmed.length > 60 ? "…" : ""),
      context: context.trim() || undefined,
      description: description.trim() || undefined,
      tags: tags
        .split(/[,\s]+/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      aiTool: aiTool || undefined,
      useCase: useCase.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      fromImage: fromImage || undefined,
    };
    setSaving(true);
    setSaveError(null);
    try {
      await savePrompt(entry);
      onSaved?.(entry);
      setContent("");
      setTitle("");
      setContext("");
      setDescription("");
      setTags("");
      setAiTool("");
      setUseCase("");
      setFromImage(false);
      setExpanded(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [
    content,
    title,
    context,
    description,
    tags,
    aiTool,
    useCase,
    fromImage,
    onSaved,
  ]);

  const handleTextFromImage = useCallback((text: string) => {
    setContent((prev) => (prev ? prev + "\n\n" + text : text));
    setFromImage(true);
    setShowImageOCR(false);
  }, []);

  const canSave = content.trim().length > 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Quick Capture
          </h2>
          <div className="flex items-center gap-2">
            <input
              ref={mdInputRef}
              type="file"
              accept=".md,text/markdown,text/plain"
              onChange={handleMdFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => mdInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
              title="Upload markdown file"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload .md
            </button>
            <button
              type="button"
              onClick={() => setShowImageOCR(!showImageOCR)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40"
              title="Extract text from image"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
              </svg>
              Image → Text
            </button>
          </div>
        </div>

        {showImageOCR && (
          <div className="mt-3">
            <ImageToText
              onTextExtracted={handleTextFromImage}
              onCancel={() => setShowImageOCR(false)}
            />
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or type your prompt here…"
          rows={4}
          className="mt-3 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />

        {expanded && (
          <div className="mt-4 space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short title for this prompt"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Context (when/where used)
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. During code review, In Cursor chat"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">AI Tool</label>
              <select
                value={aiTool}
                onChange={(e) => setAiTool(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="">Select...</option>
                {AI_TOOLS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Use case / Outcome
              </label>
              <input
                type="text"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                placeholder="What did this prompt achieve?"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="coding, refactor, debug (comma separated)"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>
        )}

        {saveError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{saveError}</p>
        )}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
          >
            {expanded ? "− Less options" : "+ More context"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saving}
            className="rounded-xl bg-amber-500 px-5 py-2.5 font-medium text-white transition hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save Prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
