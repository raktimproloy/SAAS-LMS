import { cookies } from "next/headers";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { FloatingActions } from "@/components/public/FloatingActions";
import { PWAInstallPrompt } from "@/components/public/PWAInstallPrompt";
import { MotifBackground } from "@/components/public/motif";
import { siteConfig } from "@/config/site.config";
import prisma from "@/lib/db";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");
  const studentToken = cookieStore.get("student_token");
  
  let initialLoginState: "none" | "student" | "admin" = "none";
  if (adminToken) initialLoginState = "admin";
  else if (studentToken) initialLoginState = "student";

  const settings = await prisma.siteSetting.findMany({
    where: { group_name: "site_config" }
  });
  const config = settings.reduce((acc, curr) => {
    acc[curr.setting_key] = curr.setting_value;
    return acc;
  }, {} as Record<string, string>);
  
  const siteName = config.site_name || "DoctorBiology";
  const siteLogo = config.site_logo || null;

  return (
    <div className="student-portal min-h-screen flex flex-col relative">
      <MotifBackground motif={siteConfig.motif} />
      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
        <Navbar initialLoginState={initialLoginState} siteName={siteName} siteLogo={siteLogo} />
        <main className="flex-1">{children}</main>
        <Footer siteName={siteName} siteLogo={siteLogo} config={config} />
      </div>
      <FloatingActions />
      <PWAInstallPrompt />
    </div>
  );
}
