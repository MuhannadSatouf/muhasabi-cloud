-- AlterTable
ALTER TABLE "WorkspaceKyc"
ADD COLUMN "applicantAddressLine1" TEXT,
ADD COLUMN "applicantAddressLine2" TEXT,
ADD COLUMN "applicantCity" TEXT,
ADD COLUMN "applicantRegion" TEXT,
ADD COLUMN "applicantPostalCode" TEXT,
ADD COLUMN "businessAddressLine1" TEXT,
ADD COLUMN "businessAddressLine2" TEXT,
ADD COLUMN "businessCity" TEXT,
ADD COLUMN "businessRegion" TEXT,
ADD COLUMN "businessPostalCode" TEXT,
ADD COLUMN "businessAddressCountry" TEXT;
