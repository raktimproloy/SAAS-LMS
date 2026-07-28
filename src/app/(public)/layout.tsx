import { cookies } from "next/headers";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { FloatingActions } from "@/components/public/FloatingActions";
import { PWAInstallPrompt } from "@/components/public/PWAInstallPrompt";

export default function PublicLayout({
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

  return (
    <div className="student-portal min-h-screen flex flex-col">
      <Navbar initialLoginState={initialLoginState} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingActions />
      <PWAInstallPrompt />
    </div>
  );
}
