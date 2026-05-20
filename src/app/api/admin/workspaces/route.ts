import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { isPlatformAdmin } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";

const schema = z.object({
  workspaceName: z.string().trim().min(2),
  ownerName: z.string().trim().min(2),
  ownerEmail: z.string().trim().toLowerCase().email(),
  temporaryPassword: z.string().min(8),
  planCode: z.string().trim().min(2).default("TRIAL"),
});

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(req: Request) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid workspace data" }, { status: 400 });
  }

  const data = parsed.data;
  const hashedPassword = await bcrypt.hash(data.temporaryPassword, 12);

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const plan = await tx.plan.findUnique({
      where: {
        code: data.planCode,
      },
    });

    if (!plan) {
      throw new Error("Plan not found");
    }

    const existingUser = await tx.user.findUnique({
      where: {
        email: data.ownerEmail,
      },
    });

    if (existingUser) {
      throw new Error("Owner email already exists");
    }

    const user = await tx.user.create({
      data: {
        email: data.ownerEmail,
        name: data.ownerName,
        hashedPassword,
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: data.workspaceName,
        slug: slugify(data.workspaceName),
      },
    });

    await tx.workspaceMembership.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "OWNER",
      },
    });

    const now = new Date();
    const trialEndsAt = plan.trialDays
      ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
      : null;

    await tx.subscription.create({
      data: {
        workspaceId: workspace.id,
        planId: plan.id,
        status: plan.code === "TRIAL" ? "TRIALING" : "ACTIVE",
        trialStartsAt: plan.code === "TRIAL" ? now : null,
        trialEndsAt,
      },
    });

    await tx.workspaceKyc.upsert({
      where: {
        workspaceId: workspace.id,
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        status: "NOT_STARTED",
      },
    });

    return workspace;
  });

  return NextResponse.json(result, { status: 201 });
}
