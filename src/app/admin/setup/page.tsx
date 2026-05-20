import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { prisma } from "../../../lib/prisma";
import { AdminAuthForm } from "../admin-auth-form";

export default async function AdminSetupPage() {
  const adminCount = await prisma.platformAdmin.count();

  if (adminCount > 0) {
    redirect("/admin/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create platform admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This creates the first owner account for managing all Muhasabi workspaces,
            KYC, billing, and customer access. You need the private setup token
            from the server environment.
          </p>
          <AdminAuthForm mode="setup" />
        </CardContent>
      </Card>
    </main>
  );
}
