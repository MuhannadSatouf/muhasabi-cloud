import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "../../components/layout/dashboard-shell";
import { auth } from "../../auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const cookieStore = await cookies();
  const locale =
    cookieStore.get("muhasabi-locale")?.value === "ar" ? "ar" : "en";

  return (
    <DashboardShell userName={session.user.name} locale={locale}>
      {children}
    </DashboardShell>
  );
}
