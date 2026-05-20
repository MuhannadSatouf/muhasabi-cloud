import { NextResponse } from "next/server";
import { z } from "zod";

import { isPlatformAdmin } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";

const patchSchema = z.object({
  action: z.enum(["block", "unblock"]),
  reason: z.string().trim().max(500).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { workspaceId } = await params;
  const parsed = patchSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid workspace action" }, { status: 400 });
  }

  const blocked = parsed.data.action === "block";

  const workspace = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      isBlocked: blocked,
      blockedAt: blocked ? new Date() : null,
      blockReason: blocked ? parsed.data.reason || "Blocked by platform admin" : null,
    },
  });

  return NextResponse.json(workspace);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { workspaceId } = await params;

  await prisma.workspace.delete({
    where: {
      id: workspaceId,
    },
  });

  return NextResponse.json({ ok: true });
}
