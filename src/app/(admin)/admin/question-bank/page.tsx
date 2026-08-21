"use client";

import { useEffect, useState } from "react";
import { Database, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading Question Bank...</p>
      </div>
    );
  }

  if (status === "unconfigured") {
    return (
      <div className="p-6 max-w-lg">
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
      </div>
    );
  }

  if (status === "inactive" || error) {
    return (
      <div className="p-6 max-w-lg">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 md:-m-6">
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
    </div>
  );
}
