"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="mb-2 text-center text-2xl font-bold">Create Account</h1>
                <p className="mb-6 text-center text-sm text-gray-500">
                    Start using Muhasabi Cloud
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Company Name"
                        className="w-full rounded-lg border px-4 py-3"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full rounded-lg border px-4 py-3"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full rounded-lg border px-4 py-3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full rounded-lg border px-4 py-3"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-black py-3 text-white disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="font-medium text-black underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}