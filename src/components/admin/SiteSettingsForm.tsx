"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export function SiteSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    contact_phone: "",
    contact_email: "",
    contact_whatsapp: "",
    contact_address: "",
    social_facebook: "",
    social_youtube: "",
    map_embed_url: "",
    site_name: "",
    site_logo: ""
  });
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content/site-settings")
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
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

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload file");
      setSettings({ ...settings, site_logo: uploadData.url });
    } catch (err: any) {
      alert(err.message || "An error occurred during upload");
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branding */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="font-semibold text-lg border-b pb-2 border-border/50 text-primary">Branding</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input 
                value={settings.site_name} 
                onChange={e => setSettings({...settings, site_name: e.target.value})} 
                placeholder="e.g. DoctorBiology" 
              />
            </div>
            <div className="space-y-2">
              <Label>Site Logo URL</Label>
              <Input 
                value={settings.site_logo} 
                onChange={e => setSettings({...settings, site_logo: e.target.value})} 
                placeholder="https://..." 
              />
              <div className="mt-2 flex items-center gap-4">
                <Label className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
                  {isUploadingLogo ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Upload Logo"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                </Label>
                {settings.site_logo && (
                  <div className="h-10 w-10 rounded-md overflow-hidden border bg-background/50 flex items-center justify-center p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.site_logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2 border-border/50 text-primary">Contact Information</h3>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input 
              value={settings.contact_phone} 
              onChange={e => setSettings({...settings, contact_phone: e.target.value})} 
              placeholder="+880 1XXXXXXXXX" 
            />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input 
              type="email" 
              value={settings.contact_email} 
              onChange={e => setSettings({...settings, contact_email: e.target.value})} 
              placeholder="info@instituteweb.com" 
            />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input 
              value={settings.contact_whatsapp} 
              onChange={e => setSettings({...settings, contact_whatsapp: e.target.value})} 
              placeholder="8801XXXXXXXXX" 
            />
          </div>
          <div className="space-y-2">
            <Label>Physical Address</Label>
            <Textarea 
              value={settings.contact_address} 
              onChange={e => setSettings({...settings, contact_address: e.target.value})} 
              placeholder="Farmgate, Dhaka, Bangladesh" 
              rows={3} 
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2 border-border/50 text-primary">Social Media Links</h3>
          <div className="space-y-2">
            <Label>Facebook Page URL</Label>
            <Input 
              value={settings.social_facebook} 
              onChange={e => setSettings({...settings, social_facebook: e.target.value})} 
              placeholder="https://facebook.com/instituteweb" 
            />
          </div>
          <div className="space-y-2">
            <Label>YouTube Channel URL</Label>
            <Input 
              value={settings.social_youtube} 
              onChange={e => setSettings({...settings, social_youtube: e.target.value})} 
              placeholder="https://youtube.com/@instituteweb" 
            />
          </div>
        </div>

        {/* Map Config */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="font-semibold text-lg border-b pb-2 border-border/50 text-primary">Google Map Integration</h3>
          <div className="space-y-2">
            <Label>Google Maps Embed URL (src attribute)</Label>
            <Textarea 
              value={settings.map_embed_url} 
              onChange={e => setSettings({...settings, map_embed_url: e.target.value})} 
              placeholder="https://www.google.com/maps/embed?pb=..." 
              rows={3} 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Go to Google Maps, click Share &gt; Embed a map, and copy the link inside the <code>src="..."</code> attribute.
            </p>
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
