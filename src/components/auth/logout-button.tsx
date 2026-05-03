"use client";

import { signOut } from "next-auth/react";

import { Button } from "../ui/button";

export function LogoutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-9 border-destructive/40 text-destructive hover:bg-destructive/10"
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
    >
      Sign out
    </Button>
  );
}
