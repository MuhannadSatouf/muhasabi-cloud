-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "KycIdType" AS ENUM ('NATIONAL_ID', 'PASSPORT', 'RESIDENCE_PERMIT', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkspaceBusinessType" AS ENUM ('INDIVIDUAL_ACCOUNTANT', 'ACCOUNTING_OFFICE', 'COMPANY', 'OTHER');

-- CreateTable
CREATE TABLE "WorkspaceKyc" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "applicantFullName" TEXT,
    "applicantDateOfBirth" TIMESTAMP(3),
    "applicantNationality" TEXT,
    "applicantResidenceCountry" TEXT,
    "applicantPhone" TEXT,
    "applicantAddress" TEXT,
    "applicantIdType" "KycIdType",
    "applicantIdNumber" TEXT,
    "applicantIsPep" BOOLEAN NOT NULL DEFAULT false,
    "actingOnBehalfOfAnother" BOOLEAN NOT NULL DEFAULT false,
    "businessLegalName" TEXT,
    "businessType" "WorkspaceBusinessType",
    "registrationCountry" TEXT,
    "registrationNumber" TEXT,
    "taxNumber" TEXT,
    "businessAddress" TEXT,
    "website" TEXT,
    "serviceType" TEXT,
    "expectedClientCompanies" INTEGER,
    "expectedMonthlyTransactions" INTEGER,
    "servesSanctionedCountries" BOOLEAN NOT NULL DEFAULT false,
    "highRiskIndustries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "informationConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "lastReminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceKyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycBeneficialOwner" (
    "id" TEXT NOT NULL,
    "workspaceKycId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "ownershipPercentage" DECIMAL(5,2) NOT NULL,
    "nationality" TEXT NOT NULL,
    "residenceCountry" TEXT NOT NULL,
    "isPep" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycBeneficialOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycReviewLog" (
    "id" TEXT NOT NULL,
    "workspaceKycId" TEXT NOT NULL,
    "fromStatus" "KycStatus",
    "toStatus" "KycStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KycReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceKyc_workspaceId_key" ON "WorkspaceKyc"("workspaceId");

-- Existing workspaces must enter KYC before dashboard use.
INSERT INTO "WorkspaceKyc" ("id", "workspaceId", "status", "createdAt", "updatedAt")
SELECT 'kyc_' || "id", "id", 'NOT_STARTED', NOW(), NOW()
FROM "Workspace"
ON CONFLICT ("workspaceId") DO NOTHING;

-- AddForeignKey
ALTER TABLE "WorkspaceKyc" ADD CONSTRAINT "WorkspaceKyc_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycBeneficialOwner" ADD CONSTRAINT "KycBeneficialOwner_workspaceKycId_fkey" FOREIGN KEY ("workspaceKycId") REFERENCES "WorkspaceKyc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycReviewLog" ADD CONSTRAINT "KycReviewLog_workspaceKycId_fkey" FOREIGN KEY ("workspaceKycId") REFERENCES "WorkspaceKyc"("id") ON DELETE CASCADE ON UPDATE CASCADE;
