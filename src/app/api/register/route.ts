import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { flattenError, z } from "zod";

import { prisma } from "../../../lib/prisma";

const registerSchema = z.object({
  workspaceName: z.string().min(2, "Workspace name is required"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function createSlug(companyName: string) {
  const base = companyName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const suffix = Math.floor(1000 + Math.random() * 9000);

  return `${base}-${suffix}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: flattenError(parsed.error).fieldErrors },
        { status: 400 }
      );
    }

    const { workspaceName, name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const trialPlan = await tx.plan.findUnique({
        where: {
          code: "TRIAL",
        },
      });
    
      if (!trialPlan) {
        throw new Error("TRIAL plan not found");
      }
    
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          hashedPassword,
          name,
        },
      });
    
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug: createSlug(workspaceName),
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
      const trialEndsAt = new Date(now);
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    
      await tx.subscription.create({
        data: {
          workspaceId: workspace.id,
          planId: trialPlan.id,
          status: "TRIALING",
          trialStartsAt: now,
          trialEndsAt,
        },
      });

      await tx.workspaceKyc.create({
        data: {
          workspaceId: workspace.id,
          status: "NOT_STARTED",
        },
      });

      return {
        userId: user.id,
        workspaceId: workspace.id,
      };
    });

    return NextResponse.json(
      {
        message: "Account created",
        ...result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
