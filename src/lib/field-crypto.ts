import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const PREFIX = "enc:v1";

function getKey() {
  const secret = process.env.KYC_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("KYC_ENCRYPTION_KEY or NEXTAUTH_SECRET is required");
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptField(value: string | null | undefined) {
  if (!value) return null;

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptField(value: string | null | undefined) {
  if (!value) return "";
  if (!value.startsWith(`${PREFIX}:`)) return value;

  const [, , ivRaw, tagRaw, encryptedRaw] = value.split(":");

  if (!ivRaw || !tagRaw || !encryptedRaw) return "";

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivRaw, "base64url")
  );

  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
