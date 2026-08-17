"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, CheckCircle2, Clock, Download, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<{ id: number; status: string; month: string; year: string; amount: number; created_at: string | Date; payment_method: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/payments')
      .then(res => res.json())
      .then(data => {
        setPayments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-12">
        {/* Header Banner Skeleton */}
        <div className="relative bg-card/90 dark:bg-card/40 backdrop-blur-3xl p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col justify-center items-start border border-border h-[220px]">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="w-14 h-14 rounded-2xl bg-muted shrink-0" />
            <Skeleton className="h-10 w-64 md:w-80 bg-muted rounded-xl" />
          </div>
          <Skeleton className="h-6 w-full max-w-lg bg-muted/50 rounded-md" />
        </div>

        {/* Billing Records Card Skeleton */}
        <div className="bg-card/90 dark:bg-card/40 backdrop-blur-2xl border border-border shadow-xl rounded-2xl">
          <div className="bg-background/20 border-b border-border/60 p-6 pb-4 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-full bg-muted shrink-0" />
              <Skeleton className="h-6 w-40 bg-muted rounded-md" />
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col p-6 rounded-3xl border border-border/60 bg-background/40 shadow-lg gap-6 h-[220px]">
                  <div className="flex items-start justify-between gap-4">
                    <Skeleton className="w-14 h-14 rounded-2xl bg-muted shrink-0" />
                    <Skeleton className="w-10 h-10 rounded-xl bg-muted/50 shrink-0" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-3/4 bg-muted rounded-lg" />
                    <Skeleton className="h-4 w-1/2 bg-muted/50 rounded-md" />
                  </div>
                  <div className="flex items-end justify-between pt-4 border-t border-border/60 mt-auto">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-12 bg-muted/50 rounded-md" />
                      <Skeleton className="h-8 w-24 bg-muted rounded-lg" />
                    </div>
                    <Skeleton className="w-16 h-6 rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadReceipt = (payment: { id: number; status: string; month: string; year: string; amount: number; created_at: string | Date; payment_method: string | null }) => {
    const receiptHtml = `
      <html>
        <head>
          <title>Payment Receipt - ${payment.month} ${payment.year}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #333; }
            .receipt-box { border: 1px solid #ddd; padding: 30px; max-width: 600px; margin: 0 auto; border-radius: 8px; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #eee; }
            .total { font-size: 20px; font-weight: bold; margin-top: 20px; border-top: 2px solid #333; padding-top: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <h2>Payment Receipt</h2>
              <p>Thank you for your payment!</p>
            </div>
            <div class="row"><span>Receipt ID:</span> <strong>#PAY-${payment.id.toString().padStart(6, '0')}</strong></div>
            <div class="row"><span>Date:</span> <strong>${format(new Date(payment.created_at), "PPp")}</strong></div>
            <div class="row"><span>Month/Year:</span> <strong>${payment.month} ${payment.year}</strong></div>
            <div class="row"><span>Method:</span> <strong style="text-transform: capitalize">${payment.payment_method || 'Cash'}</strong></div>
            
            <div class="row total">
              <span>Amount Paid:</span>
              <span>৳ ${payment.amount}</span>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px;" class="no-print">
            <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer; background: #000; color: #fff; border: none; border-radius: 4px;">Print Receipt</button>
          </div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(receiptHtml);
      win.document.close();
    }
  };

  return (
    <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-12">
      {/* Header Banner */}
      <div 
        className="relative bg-card/90 dark:bg-card/40 backdrop-blur-3xl p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col justify-center items-start border border-border"
        data-aos="fade-down" 
        data-aos-duration="600"
      >
        {/* Background Decor Layer - separated so overflow-hidden doesn't glitch during animation */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl transform-gpu" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl transform-gpu" />
          <div className="absolute bottom-0 right-10 opacity-[0.03]">
            <CreditCard className="w-40 h-40" />
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-4 text-foreground">
            <div className="p-3 bg-background/50 backdrop-blur-md rounded-2xl border border-border shadow-sm">
              <Receipt className="h-8 w-8 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            </div>
            Payment History
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mt-4 font-medium">
            View and manage your academic billing records and payment receipts securely.
          </p>
        </div>
      </div>

      <Card 
        className="bg-card/90 dark:bg-card/40 backdrop-blur-2xl border border-border shadow-xl rounded-2xl relative"
        data-aos="fade-up" 
        data-aos-delay="200"
      >
        <CardHeader className="bg-background/20 border-b border-border/60 pb-4 rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Receipt className="w-5 h-5 text-primary" />
            Billing Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
              <CreditCard className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No payment records found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-6">
              {payments.map(payment => (
                <div key={payment.id} className="flex flex-col p-6 rounded-3xl border border-border/60 bg-background/40 hover:bg-background/60 hover:border-border transition-colors shadow-lg gap-6 group hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`p-4 rounded-2xl shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                      payment.status === 'paid' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' :
                      payment.status === 'partial' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/20' :
                      'bg-destructive/20 text-destructive border border-destructive/20'
                    }`}>
                      {payment.status === 'paid' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    
                    {(payment.status === 'paid' || payment.status === 'partial') && (
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadReceipt(payment)} title="Download Receipt" className="rounded-xl bg-muted/50 hover:bg-primary/20 hover:text-primary transition-all shadow-sm h-10 w-10 shrink-0">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-black text-2xl text-foreground capitalize tracking-tight mb-2">{payment.month} {payment.year}</h4>
                    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2 font-medium">
                      {format(new Date(payment.created_at), "MMM d, yyyy")}
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full"></span>
                      <span className="capitalize">{payment.payment_method || 'Cash'}</span>
                    </p>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-border/60 mt-auto">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Amount</div>
                      <div className="font-black text-3xl text-foreground tracking-tight">৳ {payment.amount}</div>
                    </div>
                    <Badge variant="outline" className={`capitalize shadow-sm backdrop-blur-md px-3 py-1 text-sm font-bold
                      ${payment.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                      ${payment.status === 'due' ? 'bg-destructive/10 text-destructive border-destructive/20' : ''}
                      ${payment.status === 'partial' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                    `}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
