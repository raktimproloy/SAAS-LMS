"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, Clock, CheckCircle2, XCircle, Save, CalendarClock, Loader2, Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SmsModal } from "@/components/admin/SmsModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

interface SmsLog {
  id: number;
  student_id: number | null;
  phone: string;
  message: string;
  type: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

export default function SmsLogsPage() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSmsOpen, setIsSmsOpen] = useState(false);

  // Cron Job State
  const [cronJobId, setCronJobId] = useState<number | null>(null);
  const [cronTime, setCronTime] = useState("10:00");
  const [cronTemplate, setCronTemplate] = useState("Happy Birthday! Wishing you a day filled with happiness and a year filled with joy. - Doctor Biology");
  const [cronActive, setCronActive] = useState(false);
  const [savingCron, setSavingCron] = useState(false);

  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setBalanceLoading(true);
    setBalanceError(null);
    try {
      const res = await fetch("/api/admin/sms/balance");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch balance");
      }
      setBalance(data.balance);
    } catch (err) {
      setBalance(null);
      setBalanceError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setBalanceLoading(false);
    }
  };

  const fetchLogsAndCron = async () => {
    setLoading(true);
    try {
      const [logsRes, cronRes] = await Promise.all([
        fetch("/api/admin/sms/logs?take=100"),
        fetch("/api/admin/cron?action_type=BIRTHDAY_SMS")
      ]);
      
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs);
      }
      
      if (cronRes.ok) {
        const cronData = await cronRes.json();
        if (cronData && cronData.length > 0) {
          const job = cronData[0];
          setCronJobId(job.id);
          setCronActive(job.is_active);
          
          // Parse schedule "0 10 * * *" to "10:00"
          const parts = job.schedule.split(" ");
          if (parts.length >= 2) {
            const min = parts[0].padStart(2, '0');
            const hr = parts[1].padStart(2, '0');
            setCronTime(`${hr}:${min}`);
          }
          
          if (job.metadata) {
            try {
              const meta = JSON.parse(job.metadata);
              if (meta.template) setCronTemplate(meta.template);
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCron = async () => {
    if (!cronJobId) return;
    setSavingCron(true);
    try {
      const [hr, min] = cronTime.split(":");
      const schedule = `${parseInt(min)} ${parseInt(hr)} * * *`;
      
      const res = await fetch("/api/admin/cron", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cronJobId,
          is_active: cronActive,
          schedule,
          metadata: JSON.stringify({ template: cronTemplate })
        })
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch (error) {
      console.error(error);
    } finally {
      setSavingCron(false);
    }
  };

  useEffect(() => {
    fetchLogsAndCron();
    fetchBalance();
  }, []);

  return (
    <div className="flex flex-col gap-6" data-aos="fade-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4" data-aos="fade-down">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Operations</h1>
          <p className="text-muted-foreground mt-1">Manage bulk messaging and view SMS delivery logs.</p>
        </div>
        <Button onClick={() => setIsSmsOpen(true)} className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Send Custom SMS
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-emerald-50/80 dark:bg-emerald-950/20" data-aos="fade-up" data-aos-delay="100">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">BulkSMSBD Account Balance</p>
                {balanceLoading ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-sm text-muted-foreground">Loading balance...</span>
                  </div>
                ) : balanceError ? (
                  <p className="text-sm text-rose-600 mt-1">{balanceError}</p>
                ) : (
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                    ৳{balance?.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBalance}
              disabled={balanceLoading}
              className="gap-2 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${balanceLoading ? "animate-spin" : ""}`} />
              Refresh Balance
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 overflow-hidden relative" data-aos="fade-up" data-aos-delay="200">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <CalendarClock className="w-48 h-48" />
        </div>
        <CardHeader className="pb-3 border-b border-blue-100 dark:border-blue-900/50 bg-white/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Daily Birthday Automation
              </CardTitle>
              <CardDescription className="text-blue-700/70 dark:text-blue-300/70 mt-1">
                Automatically send birthday wishes to students on their special day.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="cron-active" className="font-semibold text-blue-900 dark:text-blue-100 cursor-pointer">
                {cronActive ? "Active" : "Paused"}
              </Label>
              <Switch 
                id="cron-active" 
                checked={cronActive}
                onCheckedChange={setCronActive}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          <div className="grid md:grid-cols-[250px_1fr] gap-6">
            <div className="space-y-2">
              <Label htmlFor="cron-time" className="text-blue-900 dark:text-blue-100 font-semibold">Delivery Time</Label>
              <Input 
                id="cron-time" 
                type="time" 
                value={cronTime}
                onChange={(e) => setCronTime(e.target.value)}
                className="bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500"
              />
              <p className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-1">
                The worker checks daily at this exact time.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cron-template" className="text-blue-900 dark:text-blue-100 font-semibold">Message Template</Label>
              <Textarea 
                id="cron-template" 
                value={cronTemplate}
                onChange={(e) => setCronTemplate(e.target.value)}
                className="bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500 min-h-[80px]"
              />
              <p className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-1">
                Use <code>{'{name}'}</code> to personalize the message.
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleSaveCron} 
              disabled={savingCron || !cronJobId}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {savingCron ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Automation Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm dark:bg-slate-800/50 overflow-hidden" data-aos="fade-up" data-aos-delay="300">
        <CardHeader>
          <CardTitle>Recent SMS Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6">
            <div className="overflow-x-auto rounded-md border border-slate-100 dark:border-slate-800">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead>Phone Number</TableHead>
                    <TableHead className="w-1/2">Message</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No SMS logs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.phone}</TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground line-clamp-2" title={log.message}>
                            {log.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.sent_at ? new Date(log.sent_at).toLocaleString() : (
                            <span className="text-muted-foreground italic flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.status === "sent" ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Sent
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">
                              <XCircle className="w-3 h-3 mr-1" /> Failed
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <SmsModal 
        isOpen={isSmsOpen} 
        onClose={() => {
          setIsSmsOpen(false);
          fetchLogsAndCron();
        }}
        targetType="custom"
      />
    </div>
  );
}
