import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "../../../../lib/prisma";
import { setAdminSession } from "../../../../lib/admin";

const strongPassword = z
  .string()
  .min(10)
  .regex(/[0-9].*[0-9]/, "Password must include at least 2 numbers.")
  .regex(/[^A-Za-z0-9]/, "Password must include at least 1 special character.");

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: strongPassword,
  confirmPassword: z.string().min(1),
  setupToken: z.string().min(16),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    });
  }
});

export async function POST(req: Request) {
  const existing = await prisma.platformAdmin.count();

  if (existing > 0) {
    return NextResponse.json(
      { error: "Admin setup is already complete." },
      { status: 403 }
    );
  }

  const parsed = schema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid admin setup data." }, { status: 400 });
  }

  const expectedToken = process.env.ADMIN_SETUP_TOKEN;

  if (!expectedToken || parsed.data.setupToken !== expectedToken) {
    return NextResponse.json({ error: "Invalid admin setup token." }, { status: 403 });
  }

  const admin = await prisma.platformAdmin.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      hashedPassword: await bcrypt.hash(parsed.data.password, 12),
      role: "SUPER_ADMIN",
      lastLoginAt: new Date(),
    },
  });

  await setAdminSession({
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  });

  return NextResponse.json({ ok: true });
}
