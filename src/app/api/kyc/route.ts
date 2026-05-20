import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { flattenError, z } from "zod";

import { auth } from "../../../auth";
import { encryptField } from "../../../lib/field-crypto";
import { addMonths } from "../../../lib/kyc";
import { prisma } from "../../../lib/prisma";

const countryCodeSchema = z.string().trim().regex(/^[A-Z]{2}$/);

const ownerSchema = z.object({
  fullName: z.string().trim().min(2),
  ownershipPercentage: z.coerce.number().min(0).max(100),
  nationality: countryCodeSchema,
  residenceCountry: countryCodeSchema,
  isPep: z.boolean(),
});

const kycSchema = z
  .object({
    applicantFullName: z.string().trim().min(2),
    applicantDateOfBirth: z.coerce.date(),
    applicantNationality: countryCodeSchema,
    applicantResidenceCountry: countryCodeSchema,
    applicantPhone: z.string().trim().min(6).max(30),
    applicantAddressLine1: z.string().trim().min(3).max(120),
    applicantAddressLine2: z.string().trim().max(120).optional(),
    applicantCity: z.string().trim().min(2).max(80),
    applicantRegion: z.string().trim().max(80).optional(),
    applicantPostalCode: z.string().trim().max(30).optional(),
    applicantIdType: z.enum(["NATIONAL_ID", "PASSPORT", "RESIDENCE_PERMIT", "OTHER"]),
    applicantIdTypeOther: z.string().trim().max(120).optional(),
    applicantIdNumber: z.string().trim().min(3).max(80),
    applicantIsPep: z.boolean(),
    actingOnBehalfOfAnother: z.boolean(),
    businessLegalName: z.string().trim().min(2),
    businessType: z.enum([
      "INDIVIDUAL_ACCOUNTANT",
      "ACCOUNTING_OFFICE",
      "COMPANY",
      "OTHER",
    ]),
    registrationCountry: countryCodeSchema,
    registrationNumber: z.string().trim().max(80).optional(),
    taxNumber: z.string().trim().max(80).optional(),
    businessAddressLine1: z.string().trim().min(3).max(120),
    businessAddressLine2: z.string().trim().max(120).optional(),
    businessCity: z.string().trim().min(2).max(80),
    businessRegion: z.string().trim().max(80).optional(),
    businessPostalCode: z.string().trim().max(30).optional(),
    businessAddressCountry: countryCodeSchema,
    website: z.string().trim().url().optional().or(z.literal("")),
    serviceType: z.string().trim().min(2).max(120),
    expectedClientCompanies: z.coerce.number().int().min(0).max(100000),
    expectedMonthlyTransactions: z.coerce.number().int().min(0).max(10000000),
    servesSanctionedCountries: z.boolean(),
    highRiskIndustries: z.array(z.string()).default([]),
    informationConfirmed: z.literal(true),
    termsAccepted: z.literal(true),
    beneficialOwners: z.array(ownerSchema).min(1),
  })
  .superRefine((data, ctx) => {
    if (data.applicantIdType === "OTHER" && !data.applicantIdTypeOther?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["applicantIdTypeOther"],
        message: "Other ID type description is required",
      });
    }

    if (
      ["ACCOUNTING_OFFICE", "COMPANY"].includes(data.businessType) &&
      !data.registrationNumber?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationNumber"],
        message: "Registration number is required for registered businesses",
      });
    }
  });

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.workspaceId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in again." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = kycSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: flattenError(parsed.error).fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const now = new Date();
    const expiresAt = addMonths(now, 6);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.workspaceKyc.findUnique({
        where: {
          workspaceId: session.user.workspaceId,
        },
        select: {
          id: true,
          status: true,
        },
      });

      const kyc = await tx.workspaceKyc.upsert({
        where: {
          workspaceId: session.user.workspaceId,
        },
        update: {
          status: "APPROVED",
          applicantFullName: data.applicantFullName,
          applicantDateOfBirth: data.applicantDateOfBirth,
          applicantNationality: data.applicantNationality,
          applicantResidenceCountry: data.applicantResidenceCountry,
          applicantPhone: encryptField(data.applicantPhone),
          applicantAddress: null,
          applicantAddressLine1: encryptField(data.applicantAddressLine1),
          applicantAddressLine2: encryptField(data.applicantAddressLine2),
          applicantCity: encryptField(data.applicantCity),
          applicantRegion: encryptField(data.applicantRegion),
          applicantPostalCode: encryptField(data.applicantPostalCode),
          applicantIdType: data.applicantIdType,
          applicantIdTypeOther: encryptField(data.applicantIdTypeOther),
          applicantIdNumber: encryptField(data.applicantIdNumber),
          applicantIsPep: data.applicantIsPep,
          actingOnBehalfOfAnother: data.actingOnBehalfOfAnother,
          businessLegalName: data.businessLegalName,
          businessType: data.businessType,
          registrationCountry: data.registrationCountry,
          registrationNumber: encryptField(data.registrationNumber),
          taxNumber: encryptField(data.taxNumber),
          businessAddress: null,
          businessAddressLine1: encryptField(data.businessAddressLine1),
          businessAddressLine2: encryptField(data.businessAddressLine2),
          businessCity: encryptField(data.businessCity),
          businessRegion: encryptField(data.businessRegion),
          businessPostalCode: encryptField(data.businessPostalCode),
          businessAddressCountry: data.businessAddressCountry,
          website: data.website || null,
          serviceType: data.serviceType,
          expectedClientCompanies: data.expectedClientCompanies,
          expectedMonthlyTransactions: data.expectedMonthlyTransactions,
          servesSanctionedCountries: data.servesSanctionedCountries,
          highRiskIndustries: data.highRiskIndustries,
          informationConfirmed: data.informationConfirmed,
          termsAccepted: data.termsAccepted,
          submittedAt: now,
          approvedAt: now,
          rejectedAt: null,
          expiresAt,
        },
        create: {
          workspaceId: session.user.workspaceId,
          status: "APPROVED",
          applicantFullName: data.applicantFullName,
          applicantDateOfBirth: data.applicantDateOfBirth,
          applicantNationality: data.applicantNationality,
          applicantResidenceCountry: data.applicantResidenceCountry,
          applicantPhone: encryptField(data.applicantPhone),
          applicantAddress: null,
          applicantAddressLine1: encryptField(data.applicantAddressLine1),
          applicantAddressLine2: encryptField(data.applicantAddressLine2),
          applicantCity: encryptField(data.applicantCity),
          applicantRegion: encryptField(data.applicantRegion),
          applicantPostalCode: encryptField(data.applicantPostalCode),
          applicantIdType: data.applicantIdType,
          applicantIdTypeOther: encryptField(data.applicantIdTypeOther),
          applicantIdNumber: encryptField(data.applicantIdNumber),
          applicantIsPep: data.applicantIsPep,
          actingOnBehalfOfAnother: data.actingOnBehalfOfAnother,
          businessLegalName: data.businessLegalName,
          businessType: data.businessType,
          registrationCountry: data.registrationCountry,
          registrationNumber: encryptField(data.registrationNumber),
          taxNumber: encryptField(data.taxNumber),
          businessAddress: null,
          businessAddressLine1: encryptField(data.businessAddressLine1),
          businessAddressLine2: encryptField(data.businessAddressLine2),
          businessCity: encryptField(data.businessCity),
          businessRegion: encryptField(data.businessRegion),
          businessPostalCode: encryptField(data.businessPostalCode),
          businessAddressCountry: data.businessAddressCountry,
          website: data.website || null,
          serviceType: data.serviceType,
          expectedClientCompanies: data.expectedClientCompanies,
          expectedMonthlyTransactions: data.expectedMonthlyTransactions,
          servesSanctionedCountries: data.servesSanctionedCountries,
          highRiskIndustries: data.highRiskIndustries,
          informationConfirmed: data.informationConfirmed,
          termsAccepted: data.termsAccepted,
          submittedAt: now,
          approvedAt: now,
          expiresAt,
        },
      });

      await tx.kycBeneficialOwner.deleteMany({
        where: {
          workspaceKycId: kyc.id,
        },
      });

      await tx.kycBeneficialOwner.createMany({
        data: data.beneficialOwners.map((owner) => ({
          workspaceKycId: kyc.id,
          fullName: owner.fullName,
          ownershipPercentage: owner.ownershipPercentage,
          nationality: owner.nationality,
          residenceCountry: owner.residenceCountry,
          isPep: owner.isPep,
        })),
      });

      await tx.kycReviewLog.create({
        data: {
          workspaceKycId: kyc.id,
          fromStatus: existing?.status ?? null,
          toStatus: "APPROVED",
          note: "Auto-approved after workspace KYC submission.",
        },
      });

      return {
        status: kyc.status,
        expiresAt,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("KYC_SUBMIT_ERROR", error);

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "KYC could not be saved. Please contact support."
            : error instanceof Error
              ? error.message
              : "KYC could not be saved. Please check the server log.",
      },
      { status: 500 }
    );
  }
}
