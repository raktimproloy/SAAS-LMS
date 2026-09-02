import { FinancialAnalyticsClient } from "@/components/admin/finance/FinancialAnalyticsClient";

export const metadata = {
  title: "Financial Analytics - Admin Panel",
};

export default function AnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Financial Analytics</h1>
        <p className="text-muted-foreground">Track your income and expenses over time.</p>
      </div>

      <FinancialAnalyticsClient />
    </div>
  );
}
