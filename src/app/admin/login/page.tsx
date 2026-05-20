import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { getPlatformAdmin } from "../../../lib/admin";
import { AdminAuthForm } from "../admin-auth-form";

export default async function AdminLoginPage() {
  const admin = await getPlatformAdmin();

  if (admin) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Platform admin login</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminAuthForm mode="login" />
        </CardContent>
      </Card>
    </main>
  );
}
