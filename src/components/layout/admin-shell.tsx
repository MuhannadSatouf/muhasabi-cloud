import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminLogoutButton } from "../auth/admin-logout-button";
import { getPlatformAdmin } from "../../lib/admin";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await getPlatformAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-semibold text-foreground">
              Muhasabi Admin
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                Customers
              </Link>
              <Link
                href="/admin/workspaces/new"
                className="text-muted-foreground hover:text-foreground"
              >
                New workspace
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {admin.email}
            </span>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
