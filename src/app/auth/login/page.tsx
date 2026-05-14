"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthPageShell } from "../../../components/auth/auth-page-shell";
import { Button } from "../../../components/ui/button";
import { inputFieldClass } from "../../../components/ui/field-classes";

export default function LoginPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setPending(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/dashboard");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPageShell>
      <div
        className="mb-8 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground lg:hidden"
        aria-hidden
      >
        م
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Login
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to Muhasabi Cloud
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          className={inputFieldClass}
          required
        />

        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          className={inputFieldClass}
          required
          minLength={8}
        />

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="brand" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthPageShell>
  );
}
