"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthPageShell } from "../../../components/auth/auth-page-shell";
import { Button } from "../../../components/ui/button";
import { inputFieldClass } from "../../../components/ui/field-classes";
import { createDefaultAccounts } from "@/lib/default-accounts";

export default function RegisterPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyName,
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      if (typeof data.error === "string") {
        setError(data.error);
      } else if (data.error && typeof data.error === "object") {
        const firstError = Object.values(data.error)
          .flat()
          .filter(Boolean)[0];

        setError(String(firstError || "Something went wrong"));
      } else {
        setError("Something went wrong");
      }

      return;
    }

    router.push("/auth/login");
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
        Create account
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Start using Muhasabi Cloud
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="text"
          name="companyName"
          autoComplete="organization"
          placeholder="Company name"
          className={inputFieldClass}
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <input
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          className={inputFieldClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          className={inputFieldClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Password"
          className={inputFieldClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="brand" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
