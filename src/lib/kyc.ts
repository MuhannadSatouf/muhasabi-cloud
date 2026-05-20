type KycState = {
  status: string;
  expiresAt: Date | null;
} | null;

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function isKycCurrent(kyc: KycState, now = new Date()) {
  if (!kyc || kyc.status !== "APPROVED") return false;
  if (!kyc.expiresAt) return false;
  return kyc.expiresAt > now;
}

export function getKycRedirectReason(kyc: KycState, now = new Date()) {
  if (!kyc) return "missing";
  if (kyc.status !== "APPROVED") return kyc.status.toLowerCase();
  if (!kyc.expiresAt || kyc.expiresAt <= now) return "expired";
  return null;
}
