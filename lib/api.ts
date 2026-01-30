import type { PromptEntry } from "./types";

const BASE = "/api/prompts";

export async function getPrompts(): Promise<PromptEntry[]> {
  const res = await fetch(BASE, { credentials: "include" });
  if (res.status === 401) {
    window.location.href = "/login?callbackUrl=" + encodeURIComponent(window.location.pathname);
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function savePrompt(prompt: PromptEntry): Promise<PromptEntry> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prompt),
    credentials: "include",
  });
  if (res.status === 401) {
    window.location.href = "/login?callbackUrl=" + encodeURIComponent(window.location.pathname);
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deletePrompt(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE", credentials: "include" });
  if (res.status === 401) {
    window.location.href = "/login?callbackUrl=" + encodeURIComponent(window.location.pathname);
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await res.text());
}
