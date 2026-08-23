"use client";

import { useEffect, useState } from "react";
import { Database, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function QuestionBankPage() {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"active" | "inactive" | "unconfigured">("unconfigured");

  useEffect(() => {
    async function load() {
      try {
        const statusRes = await fetch("/api/admin/question-bank/status");
        const statusData = await statusRes.json();
        if (!statusData.configured) {
          setStatus("unconfigured");
          setLoading(false);
          return;
        }
        if (statusData.status !== "active") {
          setStatus("inactive");
          setLoading(false);
          return;
        }
        setStatus("active");

        const sessionRes = await fetch("/api/admin/question-bank/embed-session");
        const sessionData = await sessionRes.json();
        if (!sessionRes.ok) {
          throw new Error(sessionData.error || "Failed to load embed session");
        }
        setEmbedUrl(sessionData.embed_url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load Question Bank");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64 space-y-4 shrink-0">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "unconfigured") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 sm:p-6 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Question Bank
            </CardTitle>
            <CardDescription>Integration is not configured on this server.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Add these environment variables to your LMS `.env`:</p>
            <ul className="list-disc list-inside space-y-1 font-mono text-xs">
              <li>QUESTION_BANK_API_URL</li>
              <li>QUESTION_BANK_WEB_URL</li>
              <li>QB_CLIENT_ID</li>
              <li>QB_CLIENT_SECRET</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (status === "inactive" || error) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 sm:p-6 max-w-lg">
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Question Bank Unavailable
            </CardTitle>
            <CardDescription>
              {error || "Could not connect to Question Bank. Check that the API is running and credentials match."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-col h-[calc(100vh-4rem)] sm:-m-4 md:-m-6">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Database className="h-4 w-4 text-primary" />
          Question Bank
        </div>
        {embedUrl && (
          <a
            href={embedUrl.split("?")[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            Open in new tab <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      {embedUrl && (
        <iframe
          src={embedUrl}
          title="Question Bank"
          className="flex-1 w-full border-0 bg-background"
          allow="clipboard-write"
        />
      )}
    </motion.div>
  );
}
