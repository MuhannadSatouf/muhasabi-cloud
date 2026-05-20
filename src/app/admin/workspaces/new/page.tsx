import { AdminShell } from "../../../../components/layout/admin-shell";
import { prisma } from "../../../../lib/prisma";
import { ManualWorkspaceForm } from "./manual-workspace-form";

export default async function NewWorkspacePage() {
  const plans = await prisma.plan.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      code: true,
      name: true,
    },
  });

  return (
    <AdminShell>
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Register workspace manually
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a customer workspace and owner account without public registration.
        </p>
      </div>
      <ManualWorkspaceForm plans={plans} />
    </div>
    </AdminShell>
  );
}
