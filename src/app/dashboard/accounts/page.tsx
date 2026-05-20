import { redirect } from "next/navigation";

import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { DashboardPageHeader } from "../../../components/layout/dashboard-page-header";
import { Card } from "../../../components/ui/card";

export default async function AccountsPage() {
  const session = await auth();

  if (!session?.user?.workspaceId) {
    redirect("/auth/login");
  }

  const company = await prisma.company.findFirst({
    where: {
      workspaceId: session.user.workspaceId,
    },
    select: {
      id: true,
    },
  });

  const accounts = company
    ? await prisma.account.findMany({
        where: {
          companyId: company.id,
        },
        orderBy: {
          code: "asc",
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Chart of accounts"
        subtitle="Manage your ledger structure and account hierarchy."
      />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Code
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Arabic Name
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  System
                </th>
              </tr>
            </thead>

            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No company has been created for this workspace yet.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-mono font-medium tabular-nums text-foreground">
                      {account.code}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {account.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {account.nameAr ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {account.type}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {account.isSystem ? "Yes" : "No"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
