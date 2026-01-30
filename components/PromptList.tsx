"use client";

import { useMemo, useState } from "react";
import type { PromptEntry } from "@/lib/types";
import { PromptCard } from "./PromptCard";

interface PromptListProps {
  prompts: PromptEntry[];
  onRefresh: () => void;
}

export function PromptList({ prompts: initialPrompts, onRefresh }: PromptListProps) {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [aiToolFilter, setAiToolFilter] = useState<string | null>(null);

  const prompts = useMemo(() => {
    let list = [...initialPrompts];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)) ||
          p.context?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    if (tagFilter) {
      list = list.filter((p) => p.tags.includes(tagFilter));
    }
    if (aiToolFilter) {
      list = list.filter((p) => p.aiTool === aiToolFilter);
    }
    return list;
  }, [initialPrompts, search, tagFilter, aiToolFilter]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    initialPrompts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [initialPrompts]);

  const allTools = useMemo(() => {
    const set = new Set<string>();
    initialPrompts.forEach((p) => p.aiTool && set.add(p.aiTool));
    return Array.from(set).sort();
  }, [initialPrompts]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts, tags, context…"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder-zinc-500 sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={tagFilter ?? ""}
            onChange={(e) => setTagFilter(e.target.value || null)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="">All tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={aiToolFilter ?? ""}
            onChange={(e) => setAiToolFilter(e.target.value || null)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="">All AI tools</option>
            {allTools.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {prompts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 py-16 text-center dark:border-zinc-600 dark:bg-zinc-900/50">
          <p className="text-zinc-500 dark:text-zinc-400">
            {initialPrompts.length === 0
              ? "No prompts yet. Capture your first prompt above!"
              : "No prompts match your search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {prompts.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              onDeleted={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
