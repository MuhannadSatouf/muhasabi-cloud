import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { isKycCurrent } from "../../../../lib/kyc";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.workspaceId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const kyc = await prisma.workspaceKyc.findUnique({
    where: {
      workspaceId: session.user.workspaceId,
    },
    select: {
      status: true,
      expiresAt: true,
    },
  });

  if (!isKycCurrent(kyc)) {
    return NextResponse.json(
      { error: "KYC required" },
      { status: 403 }
    );
  }

  const company = await prisma.company.findFirst({
    where: {
      workspaceId: session.user.workspaceId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      currency: true,
      createdAt: true,
    },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Company not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(company);
}
