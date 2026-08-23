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
    site_logo: "",
    footer_description: "",
    courses_hero_title: "",
    courses_hero_description: "",
    contact_section_title: "",
    contact_form_title: "",
    contact_form_description: "",
    contact_page_hero_title: "",
    contact_page_hero_highlight: "",
    contact_page_hero_description: ""
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
                onChange={e => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="e.g. DoctorBiology"
              />
            </div>
            <div className="space-y-2">
              <Label>Site Logo URL</Label>
              <Input
                value={settings.site_logo}
                onChange={e => setSettings({ ...settings, site_logo: e.target.value })}
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
          <div className="mt-4 space-y-2">
            <Label>Footer Description</Label>
            <Textarea
              value={settings.footer_description}
              onChange={e => setSettings({ ...settings, footer_description: e.target.value })}
              placeholder="e.g. মেডিকেল ভর্তি পরীক্ষা ও একাডেমিক প্রস্তুতির জন্য বাংলাদেশের সেরা অনলাইন প্ল্যাটফর্ম।"
              rows={3}
            />
          </div>
        </div>

        {/* Dynamic Texts Settings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div>
              <h3 className="font-semibold text-lg text-primary">Dynamic Section Texts</h3>
              <p className="text-sm text-muted-foreground">Manage the text content of various pages and sections</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-semibold tracking-wide uppercase">Pages UI</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Courses Page Card */}
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-slate-100 dark:bg-slate-900/80 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-semibold text-sm text-foreground">Courses Page</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Hero section titles and description</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hero Title</Label>
                  <Input
                    value={settings.courses_hero_title}
                    onChange={e => setSettings({ ...settings, courses_hero_title: e.target.value })}
                    placeholder="e.g. ক্যারিয়ার গড়ার সঠিক গাইডলাইন"
                    className="bg-background shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hero Description</Label>
                  <Textarea
                    value={settings.courses_hero_description}
                    onChange={e => setSettings({ ...settings, courses_hero_description: e.target.value })}
                    placeholder="e.g. আপনার লক্ষ্য অনুযায়ী..."
                    className="bg-background shadow-sm resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Contact Section Card */}
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-slate-100 dark:bg-slate-900/80 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-semibold text-sm text-foreground">Contact Form Section</h4>
                <p className="text-xs text-muted-foreground mt-0.5">The contact section shown across pages</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Main Title</Label>
                  <Input
                    value={settings.contact_section_title}
                    onChange={e => setSettings({ ...settings, contact_section_title: e.target.value })}
                    placeholder="e.g. অ্যাডমিশন ও কন্টাক্ট"
                    className="bg-background shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Form Title</Label>
                    <Input
                      value={settings.contact_form_title}
                      onChange={e => setSettings({ ...settings, contact_form_title: e.target.value })}
                      placeholder="e.g. অনলাইনে ভর্তি / যোগাযোগ ফর্ম"
                      className="bg-background shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Form Desc.</Label>
                    <Input
                      value={settings.contact_form_description}
                      onChange={e => setSettings({ ...settings, contact_form_description: e.target.value })}
                      placeholder="e.g. নিচের ফর্মটি পূরণ করুন..."
                      className="bg-background shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Page Hero Card (Full Width) */}
            <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-slate-100 dark:bg-slate-900/80 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-semibold text-sm text-foreground">Contact Page Hero</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Settings for /contact page top section</p>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hero Title</Label>
                  <Input
                    value={settings.contact_page_hero_title}
                    onChange={e => setSettings({ ...settings, contact_page_hero_title: e.target.value })}
                    placeholder="e.g. আমরা আছি আপনার"
                    className="bg-background shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hero Highlight</Label>
                  <Input
                    value={settings.contact_page_hero_highlight}
                    onChange={e => setSettings({ ...settings, contact_page_hero_highlight: e.target.value })}
                    placeholder="e.g. যেকোনো প্রয়োজনে"
                    className="bg-background shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hero Description</Label>
                  <Textarea
                    value={settings.contact_page_hero_description}
                    onChange={e => setSettings({ ...settings, contact_page_hero_description: e.target.value })}
                    placeholder="e.g. ভর্তি সংক্রান্ত যেকোনো তথ্য..."
                    className="bg-background shadow-sm resize-none"
                    rows={2}
                  />
                </div>
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
              onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
              placeholder="+880 1XXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={settings.contact_email}
              onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
              placeholder="info@instituteweb.com"
            />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input
              value={settings.contact_whatsapp}
              onChange={e => setSettings({ ...settings, contact_whatsapp: e.target.value })}
              placeholder="8801XXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label>Physical Address</Label>
            <Textarea
              value={settings.contact_address}
              onChange={e => setSettings({ ...settings, contact_address: e.target.value })}
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
              onChange={e => setSettings({ ...settings, social_facebook: e.target.value })}
              placeholder="https://facebook.com/instituteweb"
            />
          </div>
          <div className="space-y-2">
            <Label>YouTube Channel URL</Label>
            <Input
              value={settings.social_youtube}
              onChange={e => setSettings({ ...settings, social_youtube: e.target.value })}
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
              onChange={e => setSettings({ ...settings, map_embed_url: e.target.value })}
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
