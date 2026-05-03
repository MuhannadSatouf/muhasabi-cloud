import { DashboardPageHeader } from "../../../components/layout/dashboard-page-header";

export default function CustomersPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Customers"
        subtitle="Companies and contacts you invoice."
      />
      <p className="text-sm text-muted-foreground">
        Content will appear here as you build out the module.
      </p>
    </div>
  );
}
