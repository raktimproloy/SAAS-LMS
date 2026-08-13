"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type InstallResult = "accepted" | "dismissed" | "unavailable" | "ios" | "installed";

interface PWAInstallContextValue {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  promptInstall: () => Promise<InstallResult>;
}

const PWAInstallContext = createContext<PWAInstallContextValue | null>(null);

function detectIOS() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = ua.includes("Mac") && "ontouchend" in document;
  return iOSDevice || iPadOS;
}

function detectAndroid() {
  if (typeof window === "undefined") return false;
  return /Android/i.test(window.navigator.userAgent);
}

function detectStandalone() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    setIsInstalled(detectStandalone());
    setIsIOS(detectIOS());
    setIsAndroid(detectAndroid());

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed:", err));
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallResult> => {
    if (detectStandalone()) {
      setIsInstalled(true);
      return "installed";
    }

    if (detectIOS()) {
      return "ios";
    }

    if (!deferredPrompt) {
      return "unavailable";
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (outcome === "accepted") {
      setIsInstalled(true);
      return "accepted";
    }

    return "dismissed";
  }, [deferredPrompt]);

  const value = useMemo(
    () => ({
      canInstall: !!deferredPrompt && !isInstalled,
      isInstalled,
      isIOS,
      isAndroid,
      promptInstall,
    }),
    [deferredPrompt, isInstalled, isIOS, isAndroid, promptInstall]
  );

  return (
    <PWAInstallContext.Provider value={value}>
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall() {
  const ctx = useContext(PWAInstallContext);
  if (!ctx) {
    throw new Error("usePWAInstall must be used within PWAInstallProvider");
  }
  return ctx;
}
