"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setError("Invalid email or password");
        return;
      }
      window.location.href = callbackUrl;
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Sign in to your Prompt Library account
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 py-2.5 font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
