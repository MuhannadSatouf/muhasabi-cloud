export const dashboardNavItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    labelAr: "لوحة التحكم",
    icon: "layout" as const,
  },
  {
    href: "/dashboard/invoices",
    label: "Invoices",
    labelAr: "الفواتير",
    icon: "invoice" as const,
  },
  {
    href: "/dashboard/expenses",
    label: "Expenses",
    labelAr: "المصروفات",
    icon: "receipt" as const,
  },
  {
    href: "/dashboard/customers",
    label: "Customers",
    labelAr: "العملاء",
    icon: "users" as const,
  },
  {
    href: "/dashboard/journal",
    label: "Journal entries",
    labelAr: "قيود اليومية",
    icon: "journal" as const,
  },
  {
    href: "/dashboard/accounts",
    label: "Chart of accounts",
    labelAr: "دليل الحسابات",
    icon: "accounts" as const,
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    labelAr: "التقارير",
    icon: "chart" as const,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    labelAr: "الإعدادات",
    icon: "settings" as const,
  },
] as const;
