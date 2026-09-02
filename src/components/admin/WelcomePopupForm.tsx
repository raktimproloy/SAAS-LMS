"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export function WelcomePopupForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    welcome_popup_enabled: "false",
    welcome_popup_title: "",
    welcome_popup_text: "",
    welcome_popup_image: "",
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content/site-settings")
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ 
          ...prev, 
          ...data,
          welcome_popup_enabled: data.welcome_popup_enabled || "false" 
        }));
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload file");
      setSettings({ ...settings, welcome_popup_image: uploadData.url });
    } catch (err: any) {
      alert(err.message || "An error occurred during upload");
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <div>
            <h3 className="font-semibold text-lg text-primary">Welcome Popup</h3>
            <p className="text-sm text-muted-foreground">Manage the first-time welcome popup shown to visitors.</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="popup-enabled" className="cursor-pointer">
              {settings.welcome_popup_enabled === "true" ? "Enabled" : "Disabled"}
            </Label>
            <Switch
              id="popup-enabled"
              checked={settings.welcome_popup_enabled === "true"}
              onCheckedChange={(checked) => setSettings({ ...settings, welcome_popup_enabled: checked ? "true" : "false" })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Popup Title</Label>
          <Input
            value={settings.welcome_popup_title}
            onChange={e => setSettings({ ...settings, welcome_popup_title: e.target.value })}
            placeholder="e.g. Welcome to DoctorBiology!"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Popup Text / Description</Label>
          <Textarea
            value={settings.welcome_popup_text}
            onChange={e => setSettings({ ...settings, welcome_popup_text: e.target.value })}
            placeholder="e.g. We are excited to announce our new courses..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Popup Image URL</Label>
          <Input
            value={settings.welcome_popup_image}
            onChange={e => setSettings({ ...settings, welcome_popup_image: e.target.value })}
            placeholder="https://..."
          />
          <div className="mt-2 flex items-center gap-4">
            <Label className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
              {isUploadingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Upload Image"}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
            </Label>
            {settings.welcome_popup_image && (
              <div className="h-16 w-16 rounded-md overflow-hidden border bg-background/50 flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.welcome_popup_image} alt="Popup Image" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border mt-6 flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Configuration
        </Button>
      </div>
    </form>
  );
}
