import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LogoutButton } from "../../components/auth/logout-button";
import { LocaleToggle } from "../../components/layout/locale-toggle";
import { ThemeToggle } from "../../components/layout/theme-toggle";
import { Card, CardContent } from "../../components/ui/card";
import { auth } from "../../auth";
import { decryptField } from "../../lib/field-crypto";
import { getKycRedirectReason, isKycCurrent } from "../../lib/kyc";
import { prisma } from "../../lib/prisma";
import { KycForm, type InitialKyc } from "./kyc-form";

const copy = {
  en: {
    title: "Complete workspace KYC",
    subtitle:
      "Muhasabi Cloud requires workspace identity and business information before dashboard access. This information must be reviewed every 6 months.",
    current: "Your KYC is current. You can still update the information below.",
    blocked: "Dashboard access is limited until this form is complete.",
    status: "Current status",
  },
  ar: {
    title: "إكمال بيانات KYC لمساحة العمل",
    subtitle:
      "يتطلب محاسبي كلاود بيانات الهوية والنشاط قبل الوصول إلى لوحة التحكم. يجب تحديث هذه البيانات كل 6 أشهر.",
    current: "بيانات KYC محدثة. يمكنك تعديل المعلومات أدناه عند الحاجة.",
    blocked: "الوصول إلى لوحة التحكم محدود حتى إكمال هذا النموذج.",
    status: "الحالة الحالية",
  },
} as const;

const statusLabels = {
  en: {
    missing: "Not started",
    not_started: "Not started",
    in_progress: "In progress",
    submitted: "Submitted for review",
    approved: "Approved",
    rejected: "Needs correction",
    expired: "Expired",
  },
  ar: {
    missing: "لم يبدأ بعد",
    not_started: "لم يبدأ بعد",
    in_progress: "قيد الإكمال",
    submitted: "تم الإرسال للمراجعة",
    approved: "موافق عليه",
    rejected: "يحتاج إلى تصحيح",
    expired: "منتهي الصلاحية",
  },
} as const;

function statusLabel(locale: "en" | "ar", reason: string | null) {
  const key = (reason ?? "approved") as keyof typeof statusLabels.en;
  return statusLabels[locale][key] ?? statusLabels[locale].not_started;
}

function statusBadgeClass(reason: string | null) {
  switch (reason) {
    case null:
    case "submitted":
      return "bg-success/10 text-success ring-success/20";
    case "not_started":
    case "in_progress":
      return "bg-warning/10 text-warning ring-warning/20";
    case "missing":
    case "rejected":
    case "expired":
    default:
      return "bg-destructive/10 text-destructive ring-destructive/20";
  }
}

function dateInput(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function KycPage() {
  const session = await auth();

  if (!session?.user?.workspaceId) {
    redirect("/auth/login");
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get("muhasabi-locale")?.value === "ar" ? "ar" : "en";
  const t = copy[locale];

  const kyc = await prisma.workspaceKyc.findUnique({
    where: {
      workspaceId: session.user.workspaceId,
    },
    include: {
      beneficialOwners: {
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
      },
    },
  });

  const owner = kyc?.beneficialOwners[0];
  const current = isKycCurrent(kyc);
  const reason = getKycRedirectReason(kyc);
  const readableStatus = statusLabel(locale, reason);

  const initial: InitialKyc = {
    status: kyc?.status ?? null,
    applicantFullName: kyc?.applicantFullName ?? session.user.name ?? "",
    applicantDateOfBirth: dateInput(kyc?.applicantDateOfBirth),
    applicantNationality: kyc?.applicantNationality ?? "",
    applicantResidenceCountry: kyc?.applicantResidenceCountry ?? "",
    applicantPhone: decryptField(kyc?.applicantPhone),
    applicantAddress: decryptField(kyc?.applicantAddress),
    applicantAddressLine1: decryptField(kyc?.applicantAddressLine1),
    applicantAddressLine2: decryptField(kyc?.applicantAddressLine2),
    applicantCity: decryptField(kyc?.applicantCity),
    applicantRegion: decryptField(kyc?.applicantRegion),
    applicantPostalCode: decryptField(kyc?.applicantPostalCode),
    applicantIdType: kyc?.applicantIdType ?? "NATIONAL_ID",
    applicantIdTypeOther: decryptField(kyc?.applicantIdTypeOther),
    applicantIdNumber: decryptField(kyc?.applicantIdNumber),
    applicantIsPep: kyc?.applicantIsPep ?? false,
    actingOnBehalfOfAnother: kyc?.actingOnBehalfOfAnother ?? false,
    businessLegalName: kyc?.businessLegalName ?? "",
    businessType: kyc?.businessType ?? "INDIVIDUAL_ACCOUNTANT",
    registrationCountry: kyc?.registrationCountry ?? "",
    registrationNumber: decryptField(kyc?.registrationNumber),
    taxNumber: decryptField(kyc?.taxNumber),
    businessAddress: decryptField(kyc?.businessAddress),
    businessAddressLine1: decryptField(kyc?.businessAddressLine1),
    businessAddressLine2: decryptField(kyc?.businessAddressLine2),
    businessCity: decryptField(kyc?.businessCity),
    businessRegion: decryptField(kyc?.businessRegion),
    businessPostalCode: decryptField(kyc?.businessPostalCode),
    businessAddressCountry: kyc?.businessAddressCountry ?? "",
    website: kyc?.website ?? "",
    serviceType: kyc?.serviceType ?? "",
    expectedClientCompanies: kyc?.expectedClientCompanies ?? "",
    expectedMonthlyTransactions: kyc?.expectedMonthlyTransactions ?? "",
    servesSanctionedCountries: kyc?.servesSanctionedCountries ?? false,
    highRiskIndustries: kyc?.highRiskIndustries ?? [],
    ownerFullName: owner?.fullName ?? kyc?.applicantFullName ?? session.user.name ?? "",
    ownerOwnershipPercentage: owner ? Number(owner.ownershipPercentage) : 100,
    ownerNationality: owner?.nationality ?? kyc?.applicantNationality ?? "",
    ownerResidenceCountry: owner?.residenceCountry ?? kyc?.applicantResidenceCountry ?? "",
    ownerIsPep: owner?.isPep ?? false,
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Muhasabi Cloud</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {t.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {t.subtitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LocaleToggle locale={locale} />
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        <Card>
          <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">
              {current ? t.current : t.blocked}
            </p>
            <p className="text-sm text-muted-foreground">
              {t.status}:{" "}
              <span
                className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ${statusBadgeClass(reason)}`}
              >
                {readableStatus}
              </span>
            </p>
          </CardContent>
        </Card>

        <KycForm locale={locale} initial={initial} />
      </div>
    </main>
  );
}
