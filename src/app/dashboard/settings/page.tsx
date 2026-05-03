import { DashboardPageHeader } from "../../../components/layout/dashboard-page-header";

export default function SettingsPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Settings"
        subtitle="Workspace preferences and access."
      />
      <p className="text-sm text-muted-foreground">
        This module is coming soon.
      </p>
    </div>
  );
}
