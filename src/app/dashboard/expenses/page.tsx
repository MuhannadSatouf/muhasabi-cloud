import { DashboardPageHeader } from "../../../components/layout/dashboard-page-header";

export default function ExpensesPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Expenses"
        subtitle="Track and categorize business spending."
      />
      <p className="text-sm text-muted-foreground">
        This module is coming soon.
      </p>
    </div>
  );
}
