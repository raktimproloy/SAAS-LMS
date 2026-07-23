"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, CheckCircle2, Clock, Download } from "lucide-react";
import { format } from "date-fns";

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
    return <div className="p-8 flex justify-center"><div className="animate-pulse h-8 w-32 bg-slate-200 rounded"></div></div>;
  }

  const handleDownloadReceipt = (payment: { id: number; status: string; month: string; year: string; amount: number; created_at: string | Date; payment_method: string | null }) => {
    // Generate a simple printable receipt window
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
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payment History</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-400" />
            Billing Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No payment records found.
            </div>
          ) : (
            <div className="divide-y">
              {payments.map(payment => (
                <div key={payment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors gap-4">
                  
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full shrink-0 ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-600' :
                      payment.status === 'partial' ? 'bg-blue-100 text-blue-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {payment.status === 'paid' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white capitalize">{payment.month} {payment.year}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        {format(new Date(payment.created_at), "MMM d, yyyy")}
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="capitalize">{payment.payment_method || 'Cash'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <div className="font-bold text-xl text-slate-900 dark:text-white">৳ {payment.amount}</div>
                      <Badge variant="outline" className={`capitalize mt-1
                        ${payment.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                        ${payment.status === 'due' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                        ${payment.status === 'partial' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      `}>
                        {payment.status}
                      </Badge>
                    </div>

                    {(payment.status === 'paid' || payment.status === 'partial') && (
                      <Button variant="outline" size="icon" onClick={() => handleDownloadReceipt(payment)} title="Download Receipt">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
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
