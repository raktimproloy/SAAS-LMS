"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Wallet, X } from "lucide-react";
import type { StudentPayment } from "./types";

interface PayDueModalProps {
  open: boolean;
  payment: StudentPayment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PayDueModal({ open, payment, onClose, onSuccess }: PayDueModalProps) {
  const dueAmt = payment?.due_amount || 0;
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !payment) return;
    setAmount(String(payment.due_amount || 0));
    setPaidAt(new Date().toISOString().split("T")[0]);
    setNote("");
  }, [open, payment]);

  const payAmount = parseFloat(amount) || 0;
  const remaining = useMemo(
    () => Math.max(0, Math.round((dueAmt - payAmount) * 100) / 100),
    [dueAmt, payAmount]
  );

  if (!open || !payment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      alert("Enter an amount greater than 0");
      return;
    }
    if (payAmount > dueAmt + 0.001) {
      alert(`Cannot exceed due ৳${dueAmt.toLocaleString()}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/payments/pay-due", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_payment_id: payment.id,
          amount: payAmount,
          paid_at: paidAt,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record due payment");
      onSuccess();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to record due payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/15 p-2 text-amber-700 dark:text-amber-300">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Pay due</h2>
              <p className="text-sm text-muted-foreground">Creates a new receipt — original stays in history</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
            <div className="flex justify-between gap-3">
              <span className="text-amber-900/70 dark:text-amber-200/70">Invoice</span>
              <span className="font-semibold text-amber-950 dark:text-amber-100">
                #{payment.invoice || payment.id} · {payment.payment_type || "Payment"}
              </span>
            </div>
            <div className="mt-1 flex justify-between gap-3">
              <span className="text-amber-900/70 dark:text-amber-200/70">Month</span>
              <span className="font-medium text-amber-950 dark:text-amber-100">
                {formatPaymentMonth(payment.year, payment.month)}
              </span>
            </div>
            <div className="mt-2 flex justify-between gap-3 border-t border-amber-200/60 pt-2 dark:border-amber-900/40">
              <span className="font-medium text-amber-900 dark:text-amber-100">Outstanding due</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">৳{dueAmt.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Collecting now (৳)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              max={dueAmt}
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-semibold"
            />
            <div className="mt-1.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAmount(String(dueAmt))}
                className="cursor-pointer rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground hover:bg-muted/80"
              >
                Full due
              </button>
              {dueAmt >= 2 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(Math.round((dueAmt / 2) * 100) / 100))}
                  className="cursor-pointer rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground hover:bg-muted/80"
                >
                  Half
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Payment date</label>
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paid by guardian"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          {payAmount > 0 && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-950/40">
              <div className="flex justify-between">
                <span className="text-emerald-800 dark:text-emerald-200">New receipt</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  ৳{payAmount.toLocaleString()}
                </span>
              </div>
              <div className="mt-0.5 flex justify-between text-xs">
                <span className="text-emerald-700/80 dark:text-emerald-300/80">Due after this</span>
                <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                  ৳{remaining.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 cursor-pointer rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || payAmount <= 0}
              className="flex w-2/3 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              Record due payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatPaymentMonth(year: number, month: number) {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
