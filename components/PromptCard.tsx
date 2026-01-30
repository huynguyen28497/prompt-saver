"use client";

import { useState } from "react";
import type { PromptEntry } from "@/lib/types";
import { deletePrompt } from "@/lib/api";

interface PromptCardProps {
  prompt: PromptEntry;
  onDeleted?: (id: string) => void;
  onCopy?: (prompt: PromptEntry) => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  if (diff < 604800_000) return `${Math.floor(diff / 86400_000)}d ago`;
  return d.toLocaleDateString();
}

export function PromptCard({ prompt, onDeleted, onCopy }: PromptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (showConfirm) {
      setDeleting(true);
      try {
        await deletePrompt(prompt.id);
        onDeleted?.(prompt.id);
      } finally {
        setDeleting(false);
      }
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    onCopy?.(prompt);
  };

  const preview = prompt.content.slice(0, 150) + (prompt.content.length > 150 ? "…" : "");

  return (
    <article className="group rounded-xl border border-zinc-200 bg-white transition hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {prompt.title || "Untitled"}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              {prompt.aiTool && (
                <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                  {prompt.aiTool}
                </span>
              )}
              {prompt.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                >
                  {t}
                </span>
              ))}
              <span>{formatDate(prompt.updatedAt)}</span>
              {prompt.fromImage && (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  From image
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              title="Copy prompt"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={`rounded-lg p-1.5 ${
                showConfirm
                  ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
              } disabled:opacity-50`}
              title={showConfirm ? "Click again to delete" : "Delete"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
          {expanded ? prompt.content : preview}
        </p>
        {prompt.content.length > 150 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}

        {(prompt.context || prompt.useCase || prompt.description) && expanded && (
          <div className="mt-3 space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
            {prompt.context && (
              <p className="text-xs text-zinc-500">
                <span className="font-medium">Context:</span> {prompt.context}
              </p>
            )}
            {prompt.useCase && (
              <p className="text-xs text-zinc-500">
                <span className="font-medium">Use case:</span> {prompt.useCase}
              </p>
            )}
            {prompt.description && (
              <p className="text-xs text-zinc-500">
                <span className="font-medium">Notes:</span> {prompt.description}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
