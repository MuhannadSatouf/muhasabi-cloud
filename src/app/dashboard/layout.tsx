import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "../../components/layout/dashboard-shell";
import { auth } from "../../auth";
import { isKycCurrent } from "../../lib/kyc";
import { prisma } from "../../lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const kyc = await prisma.workspaceKyc.findUnique({
    where: {
      workspaceId: session.user.workspaceId,
    },
    select: {
      status: true,
      expiresAt: true,
    },
  });

  if (!isKycCurrent(kyc)) {
    redirect("/kyc");
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
