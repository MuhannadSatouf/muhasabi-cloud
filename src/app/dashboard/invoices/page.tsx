import { DashboardPageHeader } from "../../../components/layout/dashboard-page-header";

export default function InvoicesPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Invoices"
        subtitle="Create, send, and track customer invoices."
      />
      <p className="text-sm text-muted-foreground">
        Content will appear here as you build out the module.
      </p>
    </div>
  );
}
