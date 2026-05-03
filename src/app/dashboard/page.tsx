import { auth } from "../../auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <p className="mt-2 text-gray-600">
        Welcome, {session?.user?.name}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold">0 SYP</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Outstanding Invoices</p>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Customers</p>
          <p className="mt-2 text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}