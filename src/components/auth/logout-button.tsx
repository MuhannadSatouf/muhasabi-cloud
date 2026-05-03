"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
    >
      Sign out
    </button>
  );
}