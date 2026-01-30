"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import type { PromptEntry } from "@/lib/types";
import { getPrompts } from "@/lib/api";
import { PromptCapture } from "@/components/PromptCapture";
import { PromptList } from "@/components/PromptList";

export default function Home() {
  const [prompts, setPrompts] = useState<PromptEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPrompts();
      setPrompts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load prompts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleExport = useCallback(() => {
    const data = JSON.stringify(prompts, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-library-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [prompts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Prompt Library
                </h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  Quickly capture and organize your best AI prompts. Add
                  context, tags, and extract text from images.
                </p>
              </div>
            </div>
          </div>
          {prompts.length > 0 && (
            <button
              type="button"
              onClick={handleExport}
              className="shrink-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Export JSON
            </button>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Sign out
          </button>
        </header>

        <section className="mb-10">
          <PromptCapture onSaved={refresh} />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Saved Prompts
          </h2>
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
              <button
                type="button"
                onClick={refresh}
                className="ml-2 font-medium underline"
              >
                Retry
              </button>
            </p>
          )}
          {loading ? (
            <p className="py-8 text-center text-zinc-500">Loading…</p>
          ) : (
            <PromptList prompts={prompts} onRefresh={refresh} />
          )}
        </section>
      </div>
    </div>
  );
}
