import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { prisma } from "./prisma";

const COOKIE_NAME = "muhasabi-admin-session";

type AdminSessionPayload = {
  adminId: string;
  email: string;
  role: string;
  exp: number;
};

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET;

  if (!value) {
    throw new Error("ADMIN_SESSION_SECRET or NEXTAUTH_SECRET is required");
  }

  return value;
}

function base64url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function verifySignature(value: string, signature: string) {
  const expected = sign(value);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);

  return left.length === right.length && timingSafeEqual(left, right);
}

export function createAdminToken(payload: Omit<AdminSessionPayload, "exp">) {
  const body = base64url(
    JSON.stringify({
      ...payload,
      exp: Date.now() + 1000 * 60 * 60 * 12,
    })
  );

  return `${body}.${sign(body)}`;
}

export function parseAdminToken(token: string | undefined) {
  if (!token) return null;

  const [body, signature] = token.split(".");

  if (!body || !signature || !verifySignature(body, signature)) return null;

  const payload = JSON.parse(
    Buffer.from(body, "base64url").toString("utf8")
  ) as AdminSessionPayload;

  if (payload.exp < Date.now()) return null;

  return payload;
}

export async function setAdminSession(payload: Omit<AdminSessionPayload, "exp">) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, createAdminToken(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getPlatformAdmin() {
  const cookieStore = await cookies();
  const payload = parseAdminToken(cookieStore.get(COOKIE_NAME)?.value);

  if (!payload) return null;

  return prisma.platformAdmin.findFirst({
    where: {
      id: payload.adminId,
      isActive: true,
    },
  });
}

export async function isPlatformAdmin() {
  return Boolean(await getPlatformAdmin());
}
