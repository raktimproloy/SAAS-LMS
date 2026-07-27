import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { FloatingActions } from "@/components/public/FloatingActions";
import { PWAInstallPrompt } from "@/components/public/PWAInstallPrompt";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="student-portal min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingActions />
      <PWAInstallPrompt />
    </div>
  );
}
