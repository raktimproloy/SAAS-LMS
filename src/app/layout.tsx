import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { PWAInstallProvider } from "@/components/public/PWAInstallContext";
import { AosInitializer } from "@/components/public/AosInitializer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Institute Web LMS",
    template: "%s | Institute Web",
  },
  description: "Medical Admission & Academic Care — Best Online Platform for Biology & Medical Admission Preparation",
  keywords: ["Medical Admission", "Biology", "Institute Web", "Online Exam", "Study Materials"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Institute Web",
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: "https://instituteweb.com",
    siteName: "Institute Web LMS",
    title: "Institute Web LMS",
    description: "Medical Admission & Academic Care",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Institute Web" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen bg-background relative overflow-x-hidden`}>
        {/* Global Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[0] bg-background">
          <div 
            className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] sm:blur-[140px] opacity-50 dark:opacity-30 animate-blob" 
            style={{ background: 'hsl(var(--gradient-1) / 0.4)' }}
          />
          <div 
            className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full blur-[100px] sm:blur-[140px] opacity-50 dark:opacity-30 animate-blob animation-delay-4000" 
            style={{ background: 'hsl(var(--gradient-2) / 0.4)' }}
          />
          <div 
            className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full blur-[100px] sm:blur-[140px] opacity-50 dark:opacity-30 animate-blob animation-delay-6000" 
            style={{ background: 'hsl(var(--gradient-3) / 0.4)' }}
          />
        </div>

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PWAInstallProvider>
            <AosInitializer />
            <div className="relative z-10 flex flex-col min-h-screen">
              {children}
            </div>
          </PWAInstallProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
