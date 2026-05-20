"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/button";
import { inputFieldClass } from "../../components/ui/field-classes";

export function AdminAuthForm({ mode }: { mode: "login" | "setup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
        confirmPassword: String(fd.get("confirmPassword") ?? ""),
        setupToken: String(fd.get("setupToken") ?? ""),
      }),
    });

    const data = await res.json().catch(() => null);
    setPending(false);

    if (!res.ok) {
      setError(data?.error ?? "Could not continue.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "setup" ? (
        <input
          name="name"
          placeholder="Your name"
          required
          minLength={2}
          className={inputFieldClass}
        />
      ) : null}
      {mode === "setup" ? (
        <input
          name="setupToken"
          type="password"
          placeholder="One-time setup token"
          required
          minLength={16}
          className={inputFieldClass}
        />
      ) : null}
      <input
        name="email"
        type="email"
        placeholder="Admin email"
        required
        className={inputFieldClass}
      />
      <input
        name="password"
        type="password"
        placeholder="Admin password"
        required
        minLength={mode === "setup" ? 10 : 1}
        pattern={mode === "setup" ? "^(?=(?:.*\\d){2,})(?=.*[^A-Za-z0-9]).{10,}$" : undefined}
        title={
          mode === "setup"
            ? "At least 10 characters, 2 numbers, and 1 special character."
            : undefined
        }
        className={inputFieldClass}
      />
      {mode === "setup" ? (
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm admin password"
          required
          minLength={10}
          className={inputFieldClass}
        />
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? "Please wait..."
          : mode === "setup"
            ? "Create platform admin"
            : "Sign in"}
      </Button>
    </form>
  );
}
