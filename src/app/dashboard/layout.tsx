import { auth } from "../../auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "../../components/auth/logout-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/accounts", label: "Chart of Accounts" },
  { href: "/dashboard/journal", label: "Journal Entries" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/reports", label: "Reports" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 border-r bg-white p-6">
        <h2 className="mb-8 text-xl font-bold">Muhasabi Cloud</h2>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8">
          <div>
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="font-medium">{session.user.name}</p>
          </div>

          <LogoutButton />
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}