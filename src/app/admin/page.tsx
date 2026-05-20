import Link from "next/link";

import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { buttonClassName } from "../../components/ui/button";
import { AdminShell } from "../../components/layout/admin-shell";
import { prisma } from "../../lib/prisma";

function statusClass(status: string | null | undefined) {
  if (status === "APPROVED" || status === "SUBMITTED") return "paid";
  if (status === "NOT_STARTED" || status === "IN_PROGRESS") return "due";
  return "overdue";
}

export default async function AdminPage() {
  const workspaces = await prisma.workspace.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      memberships: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
      },
      companies: {
        select: {
          id: true,
        },
      },
      subscription: {
        include: {
          plan: true,
        },
      },
      kyc: true,
    },
  });

  return (
    <AdminShell>
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Customers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review workspaces, subscriptions, and KYC status.
          </p>
        </div>
        <Link href="/admin/workspaces/new" className={buttonClassName("brand")}>
          Register workspace
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-start text-xs font-medium uppercase text-muted-foreground">
                  Workspace
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase text-muted-foreground">
                  Owner
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase text-muted-foreground">
                  Plan
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase text-muted-foreground">
                  Subscription
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase text-muted-foreground">
                  KYC
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase text-muted-foreground">
                  Access
                </th>
                <th className="px-4 py-3 text-end text-xs font-medium uppercase text-muted-foreground">
                  Companies
                </th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((workspace) => {
                const owner = workspace.memberships[0]?.user;

                return (
                  <tr key={workspace.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/workspaces/${workspace.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {workspace.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{workspace.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{owner?.name ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">{owner?.email ?? "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {workspace.subscription?.plan.name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {workspace.subscription?.status ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusClass(workspace.kyc?.status)}>
                        {workspace.kyc?.status ?? "MISSING"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={workspace.isBlocked ? "overdue" : "paid"}>
                        {workspace.isBlocked ? "BLOCKED" : "ACTIVE"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-end font-mono tabular-nums">
                      {workspace.companies.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
    </AdminShell>
  );
}
