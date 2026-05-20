import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { setAdminSession } from "../../../../lib/admin";
import { prisma } from "../../../../lib/prisma";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const admin = await prisma.platformAdmin.findFirst({
    where: {
      email: parsed.data.email,
      isActive: true,
    },
  });

  if (!admin) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(parsed.data.password, admin.hashedPassword);

  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await prisma.platformAdmin.update({
    where: {
      id: admin.id,
    },
    data: {
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
