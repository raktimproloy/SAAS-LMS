import { AdminLayout } from "@/components/admin/AdminLayout";
import prisma from "@/lib/db";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await prisma.siteSetting.findMany({
    where: { group_name: "site_config" }
  });
  const config = settings.reduce((acc, curr) => {
    acc[curr.setting_key] = curr.setting_value;
    return acc;
  }, {} as Record<string, string>);
  
  const siteName = config.site_name || "Institute Web";
  const siteLogo = config.site_logo || null;
  const hasFinancialPassword = !!config.financial_password;

  return <AdminLayout siteName={siteName} siteLogo={siteLogo} hasFinancialPassword={hasFinancialPassword}>{children}</AdminLayout>;
}
