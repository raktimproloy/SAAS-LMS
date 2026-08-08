"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, AlertCircle } from "lucide-react";

interface SmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "course" | "batch" | "student" | "custom";
  targetId?: number;
  targetName?: string;
  defaultTemplate?: string;
  smsType?: string;
  recipientCount?: number; // Estimated number of base recipients (e.g. students in batch)
}

export function SmsModal({ 
  isOpen, 
  onClose, 
  targetType, 
  targetId, 
  targetName, 
  defaultTemplate = "", 
  smsType = "general",
  recipientCount = 1
}: SmsModalProps) {
  const [template, setTemplate] = useState(defaultTemplate);
  const [sendToStudent, setSendToStudent] = useState(true);
  const [sendToParent, setSendToParent] = useState(false);
  const [customNumbers, setCustomNumbers] = useState("");
  const [isBirthdayWish, setIsBirthdayWish] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTemplate(defaultTemplate);
      setSendToStudent(true);
      setSendToParent(false);
      setCustomNumbers("");
      setIsBirthdayWish(false);
      setError("");
      setSuccess("");
    }
  }, [isOpen, defaultTemplate]);

  // SMS Calculation Logic
  const hasUnicode = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 127) return true;
    }
    return false;
  };

  const isUnicode = hasUnicode(template);
  const charLength = template.length;
  
  let partsCount = 1;
  if (isUnicode) {
    if (charLength > 70) {
      partsCount = Math.ceil(charLength / 67);
    }
  } else {
    if (charLength > 160) {
      partsCount = Math.ceil(charLength / 153);
    }
  }

  const multiplier = (sendToStudent ? 1 : 0) + (sendToParent ? 1 : 0);
  const totalSmsPartsPerStudent = partsCount * multiplier;
  const estimatedTotalSms = totalSmsPartsPerStudent * (recipientCount || 0);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!template.trim()) {
      setError("Message cannot be empty.");
      return;
    }
    if (!sendToStudent && !sendToParent) {
      setError("Please select at least one recipient type (Student or Parent).");
      return;
    }

    if (targetType === "custom" && !customNumbers.trim()) {
      setError("Please enter at least one recipient number.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const numbersList = customNumbers.split(',').map(n => n.trim()).filter(Boolean);
      
      const res = await fetch("/api/admin/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          custom_numbers: numbersList,
          message_template: template,
          send_to_student: sendToStudent,
          send_to_parent: sendToParent,
          sms_type: isBirthdayWish ? "birthday" : smsType
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send SMS");
      
      setSuccess(`Successfully sent ${data.sentCount} SMS out of ${data.totalAttempted} attempts.`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send SMS to {targetType === 'student' ? targetName : `${targetType} ${targetName}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm border border-green-200 flex items-center gap-2">
              <Send className="w-4 h-4" /> {success}
            </div>
          )}

          {targetType === "custom" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="customNumbers">Recipient Numbers (comma separated)</Label>
                <Textarea
                  id="customNumbers"
                  value={customNumbers}
                  onChange={(e) => setCustomNumbers(e.target.value)}
                  placeholder="017..., 018..."
                  className="min-h-[60px] resize-none"
                />
              </div>
              <div className="flex items-center gap-2 my-2">
                <input 
                  type="checkbox" 
                  id="birthday_wish" 
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  checked={isBirthdayWish}
                  onChange={(e) => {
                    setIsBirthdayWish(e.target.checked);
                    if (e.target.checked) {
                      setTemplate("Happy Birthday! Wishing you a day filled with happiness and a year filled with joy. - Doctor Biology");
                    } else {
                      setTemplate(defaultTemplate);
                    }
                  }}
                />
                <Label htmlFor="birthday_wish" className="font-semibold cursor-pointer text-blue-600">Preset: Birthday Wish Template</Label>
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="template">Message Template</Label>
            <Textarea
              id="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Write your message here... Use {name} for student name."
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
              <span>Variables: <code className="bg-muted px-1 rounded">{'{name}'}</code>, <code className="bg-muted px-1 rounded">{'{student_id}'}</code></span>
              <div className="flex items-center gap-2">
                <Badge variant={isUnicode ? "default" : "secondary"}>{isUnicode ? "Unicode (Bangla)" : "Standard (English)"}</Badge>
                <span>{charLength} chars | {partsCount} {partsCount === 1 ? 'part' : 'parts'}</span>
              </div>
            </div>
          </div>

          {targetType !== "custom" && (
            <div className="grid gap-4 mt-4">
              <Label>Recipients Options</Label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-900 border px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                    checked={sendToStudent}
                    onChange={(e) => setSendToStudent(e.target.checked)}
                  />
                  <span className="text-sm font-medium">Send to Student&apos;s Phone</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-900 border px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                    checked={sendToParent}
                    onChange={(e) => setSendToParent(e.target.checked)}
                  />
                  <span className="text-sm font-medium">Send to Parent&apos;s Phone</span>
                </label>
              </div>
            </div>
          )}

          <div className="bg-primary/5 p-4 rounded-lg mt-2 border border-primary/10">
            <h4 className="text-sm font-semibold mb-2">Estimated Usage</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Estimated Students: </span>
                <span className="font-semibold">{targetType === "custom" ? (customNumbers.split(',').filter(n=>n.trim()).length || 0) : recipientCount || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">SMS Multiplier: </span>
                <span className="font-semibold">x{targetType === "custom" ? 1 : multiplier}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-primary/10">
                <span className="text-muted-foreground">Total SMS Credits Required: </span>
                <span className="font-semibold text-primary">~{targetType === "custom" ? partsCount * (customNumbers.split(',').filter(n=>n.trim()).length || 0) : estimatedTotalSms}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting || (targetType !== "custom" && !sendToStudent && !sendToParent)} className="gap-2">
              <Send className="w-4 h-4" />
              {isSubmitting ? "Sending..." : "Send SMS"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
