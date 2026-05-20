"use client";

import { useRouter } from "next/navigation";

import { Button } from "../ui/button";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" className="h-9" onClick={logout}>
      Sign out
    </Button>
  );
}
