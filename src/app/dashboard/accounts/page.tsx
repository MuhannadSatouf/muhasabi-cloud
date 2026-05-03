import { DashboardPageHeader } from "../../../components/layout/dashboard-page-header";

export default function AccountsPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Chart of accounts"
        subtitle="Manage your ledger structure and account hierarchy."
      />
      <p className="text-sm text-muted-foreground">
        Content will appear here as you build out the module.
      </p>
    </div>
  );
}
