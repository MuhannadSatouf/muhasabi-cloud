import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isPlatformAdmin } from "../../../../../lib/admin";
import { prisma } from "../../../../../lib/prisma";

const schema = z.object({
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "APPROVED", "REJECTED", "EXPIRED"]),
  expiresAt: z.string().optional(),
  note: z.string().trim().max(500).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { workspaceId } = await params;
  const parsed = schema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid KYC update" }, { status: 400 });
  }

  const { status, expiresAt, note } = parsed.data;
  const expiresDate = expiresAt ? new Date(`${expiresAt}T23:59:59.000Z`) : null;

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.workspaceKyc.findUnique({
      where: {
        workspaceId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existing) {
      return tx.workspaceKyc.create({
        data: {
          workspaceId,
          status,
          approvedAt: status === "APPROVED" ? new Date() : null,
          rejectedAt: status === "REJECTED" ? new Date() : null,
          expiresAt: expiresDate,
          reviewLogs: {
            create: {
              fromStatus: null,
              toStatus: status,
              note: note || "Admin created KYC status.",
            },
          },
        },
      });
    }

    const kyc = await tx.workspaceKyc.update({
      where: {
        workspaceId,
      },
      data: {
        status,
        approvedAt: status === "APPROVED" ? new Date() : undefined,
        rejectedAt: status === "REJECTED" ? new Date() : null,
        expiresAt: expiresDate,
      },
    });

    await tx.kycReviewLog.create({
      data: {
        workspaceKycId: existing.id,
        fromStatus: existing.status,
        toStatus: status,
        note: note || "Admin updated KYC status.",
      },
    });

    return kyc;
  });

  return NextResponse.json(result);
}
