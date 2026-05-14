import type { Prisma } from "@prisma/client";

/** Must match `enum AccountType` in `prisma/schema.prisma`. */
type AccountTypeLiteral = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

type DefaultAccountRow = {
  code: string;
  name: string;
  nameAr: string;
  type: AccountTypeLiteral;
  isSystem: boolean;
};

const defaultAccounts: DefaultAccountRow[] = [
  { code: "1000", name: "Cash on Hand", nameAr: "الصندوق", type: "ASSET", isSystem: true },
  { code: "1010", name: "Bank Account", nameAr: "حساب بنكي", type: "ASSET", isSystem: true },
  { code: "1100", name: "Accounts Receivable", nameAr: "ذمم مدينة", type: "ASSET", isSystem: true },

  { code: "2000", name: "Accounts Payable", nameAr: "ذمم دائنة", type: "LIABILITY", isSystem: true },

  { code: "3000", name: "Owner Capital", nameAr: "رأس المال", type: "EQUITY", isSystem: true },
  { code: "3100", name: "Retained Earnings", nameAr: "الأرباح المحتجزة", type: "EQUITY", isSystem: true },

  { code: "4000", name: "Sales Revenue", nameAr: "إيرادات المبيعات", type: "REVENUE", isSystem: true },
  { code: "4100", name: "Service Revenue", nameAr: "إيرادات الخدمات", type: "REVENUE", isSystem: true },

  { code: "5000", name: "Operating Expenses", nameAr: "مصاريف تشغيلية", type: "EXPENSE", isSystem: true },
];

export async function createDefaultAccounts(
  tx: Prisma.TransactionClient,
  companyId: string
) {
  await tx.account.createMany({
    data: defaultAccounts.map((account) => ({
      ...account,
      companyId,
    })),
    skipDuplicates: true,
  });
}