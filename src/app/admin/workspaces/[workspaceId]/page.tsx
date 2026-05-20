import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "../../../../components/layout/admin-shell";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { decryptField } from "../../../../lib/field-crypto";
import { prisma } from "../../../../lib/prisma";
import { KycAdminForm } from "./kyc-admin-form";
import { WorkspaceAdminActions } from "./workspace-admin-actions";

function dateInput(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function row(label: string, value: unknown) {
  return (
    <div className="border-b border-border py-2 last:border-0">
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{String(value || "-")}</dd>
    </div>
  );
}

export default async function AdminWorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    include: {
      memberships: {
        include: {
          user: true,
        },
      },
      companies: true,
      subscription: {
        include: {
          plan: true,
        },
      },
      kyc: {
        include: {
          beneficialOwners: true,
          reviewLogs: {
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          },
        },
      },
    },
  });

  if (!workspace) notFound();

  const kyc = workspace.kyc;
  const owner = kyc?.beneficialOwners[0];

  return (
    <AdminShell>
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          Back to customers
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {workspace.name}
        </h1>
        <p className="text-sm text-muted-foreground">{workspace.slug}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              {row("Members", workspace.memberships.length)}
              {row("Companies", workspace.companies.length)}
              {row("Blocked", workspace.isBlocked ? "Yes" : "No")}
              {row("Block reason", workspace.blockReason)}
              {row("Created", workspace.createdAt.toLocaleDateString())}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              {row("Plan", workspace.subscription?.plan.name)}
              {row("Status", workspace.subscription?.status)}
              {row("Stripe customer", workspace.subscription?.providerCustomerId)}
              {row("Stripe subscription", workspace.subscription?.providerSubscriptionId)}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>KYC status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant={kyc?.status === "APPROVED" ? "paid" : "due"}>
              {kyc?.status ?? "MISSING"}
            </Badge>
            <KycAdminForm
              workspaceId={workspace.id}
              status={kyc?.status ?? "NOT_STARTED"}
              expiresAt={dateInput(kyc?.expiresAt)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace controls</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkspaceAdminActions
            workspaceId={workspace.id}
            isBlocked={workspace.isBlocked}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KYC answers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          <dl>
            {row("Applicant name", kyc?.applicantFullName)}
            {row("Date of birth", dateInput(kyc?.applicantDateOfBirth))}
            {row("Nationality", kyc?.applicantNationality)}
            {row("Residence country", kyc?.applicantResidenceCountry)}
            {row("Phone", decryptField(kyc?.applicantPhone))}
            {row("ID type", kyc?.applicantIdType)}
            {row("ID other", decryptField(kyc?.applicantIdTypeOther))}
            {row("ID number", decryptField(kyc?.applicantIdNumber))}
            {row("PEP", kyc?.applicantIsPep ? "Yes" : "No")}
          </dl>
          <dl>
            {row("Residential street", decryptField(kyc?.applicantAddressLine1))}
            {row("Residential line 2", decryptField(kyc?.applicantAddressLine2))}
            {row("Residential city", decryptField(kyc?.applicantCity))}
            {row("Residential region", decryptField(kyc?.applicantRegion))}
            {row("Residential postal", decryptField(kyc?.applicantPostalCode))}
            {row("Acting for another", kyc?.actingOnBehalfOfAnother ? "Yes" : "No")}
          </dl>
          <dl>
            {row("Business legal name", kyc?.businessLegalName)}
            {row("Business type", kyc?.businessType)}
            {row("Registration country", kyc?.registrationCountry)}
            {row("Registration number", decryptField(kyc?.registrationNumber))}
            {row("Tax number", decryptField(kyc?.taxNumber))}
            {row("Business address country", kyc?.businessAddressCountry)}
            {row("Business street", decryptField(kyc?.businessAddressLine1))}
            {row("Business city", decryptField(kyc?.businessCity))}
            {row("Service type", kyc?.serviceType)}
            {row("Expected clients", kyc?.expectedClientCompanies)}
            {row("Expected monthly tx", kyc?.expectedMonthlyTransactions)}
            {row("Sanctioned countries", kyc?.servesSanctionedCountries ? "Yes" : "No")}
            {row("High risk industries", kyc?.highRiskIndustries.join(", "))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Beneficial owner</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 md:grid-cols-4">
            {row("Name", owner?.fullName)}
            {row("Ownership", owner ? `${owner.ownershipPercentage}%` : "-")}
            {row("Nationality", owner?.nationality)}
            {row("Residence", owner?.residenceCountry)}
            {row("PEP", owner?.isPep ? "Yes" : "No")}
          </dl>
        </CardContent>
      </Card>
    </div>
    </AdminShell>
  );
}
