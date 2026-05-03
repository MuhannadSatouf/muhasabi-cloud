import { cookies } from "next/headers";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { auth } from "../../auth";
import { buttonClassName } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader } from "../../components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const locale = cookieStore.get("muhasabi-locale")?.value === "ar" ? "ar" : "en";
  const ar = locale === "ar";
  const name = session?.user?.name ?? (ar ? "ضيف" : "there");

  const heroTitle = ar ? `أهلاً بك، ${name} 👋` : `Welcome, ${name}`;
  const heroSub = ar
    ? "إليك ملخص أداء أعمالك لهذا الشهر"
    : "Here is a snapshot of how your business is performing this month.";

  const newInvoice = ar ? "فاتورة جديدة" : "New invoice";

  const stats = ar
    ? [
        {
          label: "الإيرادات",
          value: "483,300 ر.س",
          delta: "+12.4%",
          up: true,
          icon: Wallet,
        },
        {
          label: "المصروفات",
          value: "128,400 ر.س",
          delta: "-3.1%",
          up: false,
          icon: Banknote,
        },
        {
          label: "فواتير معلّقة",
          value: "14",
          delta: "+2",
          up: true,
          icon: Sparkles,
        },
        {
          label: "العملاء النشطون",
          value: "38",
          delta: "+4.2%",
          up: true,
          icon: Users,
        },
      ]
    : [
        {
          label: "Revenue this month",
          value: "483,300 SYP",
          delta: "+12.4%",
          up: true,
          icon: Wallet,
        },
        {
          label: "Expenses",
          value: "128,400 SYP",
          delta: "-3.1%",
          up: false,
          icon: Banknote,
        },
        {
          label: "Outstanding invoices",
          value: "14",
          delta: "+2",
          up: true,
          icon: Sparkles,
        },
        {
          label: "Active customers",
          value: "38",
          delta: "+4.2%",
          up: true,
          icon: Users,
        },
      ];

  const tableTitle = ar ? "آخر الفواتير" : "Latest invoices";
  const tableSub = ar
    ? "أحدث حركات الفوترة لديك"
    : "Your most recent billing activity.";
  const viewAll = ar ? "عرض الكل" : "View all";

  const thInvoice = ar ? "رقم الفاتورة" : "Invoice";
  const thCustomer = ar ? "العميل" : "Customer";
  const thAmount = ar ? "المبلغ" : "Amount";
  const thStatus = ar ? "الحالة" : "Status";

  const rows = ar
    ? [
        {
          inv: "INV-1042",
          cust: "شركة النور",
          amt: "12,500 ر.س",
          variant: "paid" as const,
          status: "مدفوعة",
        },
        {
          inv: "INV-1041",
          cust: "مؤسسة الرياض",
          amt: "8,200 ر.س",
          variant: "due" as const,
          status: "معلقة",
        },
        {
          inv: "INV-1038",
          cust: "متجر الواحة",
          amt: "3,000 ر.س",
          variant: "overdue" as const,
          status: "متأخرة",
        },
      ]
    : [
        {
          inv: "INV-1042",
          cust: "Acme Co.",
          amt: "12,500 SYP",
          variant: "paid" as const,
          status: "Paid",
        },
        {
          inv: "INV-1041",
          cust: "Beta LLC",
          amt: "8,200 SYP",
          variant: "due" as const,
          status: "Pending",
        },
        {
          inv: "INV-1038",
          cust: "Gamma Ltd",
          amt: "3,000 SYP",
          variant: "overdue" as const,
          status: "Overdue",
        },
      ];

  return (
    <div className="space-y-8">
      <section className="rounded-[var(--radius)] bg-primary px-6 py-8 text-primary-foreground shadow-md sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {heroTitle}
            </h1>
            <p className="max-w-xl text-sm text-primary-foreground/90 sm:text-base">
              {heroSub}
            </p>
          </div>
          <Link
            href="/dashboard/invoices"
            className={buttonClassName(
              "outline",
              "h-10 shrink-0 border-primary-foreground/40 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            )}
          >
            {newInvoice}
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="overflow-hidden py-0 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-6">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <div
                  className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground"
                  aria-hidden
                >
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="pb-6 pt-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                    {card.value}
                  </p>
                  <span
                    className={
                      card.up
                        ? "inline-flex items-center gap-0.5 text-xs font-medium text-success"
                        : "inline-flex items-center gap-0.5 text-xs font-medium text-destructive"
                    }
                  >
                    {card.up ? (
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    ) : (
                      <ArrowDownRight className="size-3.5" aria-hidden />
                    )}
                    {card.delta}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {tableTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{tableSub}</p>
          </div>
          <Link
            href="/dashboard/invoices"
            className={buttonClassName("outline", "h-9 self-start px-4 text-xs sm:self-auto")}
          >
            {viewAll}
          </Link>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {thInvoice}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {thCustomer}
                  </th>
                  <th className="px-4 py-3 text-end text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {thAmount}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {thStatus}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.inv} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{row.inv}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.cust}</td>
                    <td className="px-4 py-3 text-end font-mono tabular-nums text-foreground">
                      {row.amt}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={row.variant}>{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
