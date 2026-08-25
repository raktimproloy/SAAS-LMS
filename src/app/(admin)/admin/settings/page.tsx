"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [financialPassword, setFinancialPassword] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userPerms, setUserPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingFinancial, setSavingFinancial] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [financialMessage, setFinancialMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/admin/me");
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setEmail(data.email || "");
          setUserRole(data.role || "");
          setUserPerms(data.permissions || []);
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings/financial-password");
        if (res.ok) {
          const data = await res.json();
          // If hasPassword is true, maybe we just leave it blank but we know it's set.
          // The placeholder will say "Leave blank for no password protection" or similar.
          // We won't set the actual value.
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };

    Promise.all([fetchUser(), fetchSettings()]).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/admin/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setPassword(""); // Clear password field after saving
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinancialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFinancial(true);
    setFinancialMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/admin/settings/financial-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: financialPassword }),
      });

      if (res.ok) {
        const data = await res.json();
        setFinancialMessage({ type: "success", text: data.message || "Financial password updated successfully!" });
        setFinancialPassword(""); // clear after success
      } else {
        const data = await res.json();
        setFinancialMessage({ type: "error", text: data.error || "Failed to update financial password" });
      }
    } catch {
      setFinancialMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSavingFinancial(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your personal profile and security.</p>
      </div>

      <Card className="border-none shadow-sm dark:bg-slate-800/50">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your display name or change your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message.text && (
              <div className={`p-3 rounded-md text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {message.text}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="password">New Password (Leave blank to keep current)</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            
            <div className="pt-4 border-t mt-4 flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {(userRole === "super_admin" || userPerms.includes("all")) && (
        <Card className="border-none shadow-sm dark:bg-slate-800/50 mt-2">
          <CardHeader>
            <CardTitle>Financial Security</CardTitle>
            <CardDescription>Set a password to protect the Financial dropdown in the sidebar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFinancialSubmit} className="space-y-4">
              {financialMessage.text && (
                <div className={`p-3 rounded-md text-sm border ${financialMessage.type === 'success' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                  {financialMessage.text}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="financial_password">Financial Dropdown Password</Label>
                <Input 
                  id="financial_password" 
                  type="password" 
                  value={financialPassword} 
                  onChange={(e) => setFinancialPassword(e.target.value)} 
                  placeholder="Leave blank to remove password" 
                />
                <p className="text-xs text-muted-foreground">If set, any admin will need to enter this password to view payments and expenses.</p>
              </div>
              
              <div className="pt-4 border-t mt-4 flex justify-end">
                <Button type="submit" disabled={savingFinancial}>
                  {savingFinancial ? "Saving..." : "Save Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
