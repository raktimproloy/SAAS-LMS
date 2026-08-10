"use client";

import { useEffect, useState } from "react";
import { User, Phone, MapPin, Mail, Calendar, Users, Camera, Shield, LogOut, Pencil, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StudentData {
  student_id: string;
  name: string;
  photo: string | null;
  batch: { name: string; course: { title: string } };
  phone: string | null;
  email: string | null;
  dob: string | Date | null;
  gender: string | null;
  address: string | null;
  parent_name: string | null;
  parent_relation: string | null;
  parent_phone: string | null;
}

export default function StudentProfile() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhoto, setEditPhoto] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const handleLogout = async () => {
    try {
      await fetch('/api/student/auth/logout', { method: 'POST' });
      window.location.href = '/student/login';
    } catch (err) {
      console.error(err);
    }
  };

  const loadProfile = () => {
    return fetch('/api/student/me')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error && data.name) {
          setStudent(data);
        } else {
          console.error("Failed to load profile:", data);
          setStudent(null);
        }
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const openEditDialog = () => {
    if (!student) return;
    setEditName(student.name);
    setEditAddress(student.address || "");
    setEditPhoto(student.photo || "");
    setEditError("");
    setIsEditOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setEditError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload photo");
      setEditPhoto(data.url);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setEditError("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    setEditError("");

    try {
      const res = await fetch("/api/student/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, address: editAddress, photo: editPhoto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setStudent(data.data);
      setIsEditOpen(false);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-12">
        {/* Banner Skeleton */}
        <div className="relative overflow-hidden bg-card/20 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-8 border border-white/5 h-[300px] md:h-[260px] w-full">
          <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-white/10 shrink-0" />
          <div className="flex flex-col items-center md:items-start space-y-4 w-full mt-4 md:mt-0">
            <Skeleton className="h-6 w-32 bg-white/10 rounded-full" />
            <Skeleton className="h-10 w-64 md:w-96 bg-white/10 rounded-2xl" />
            <Skeleton className="h-6 w-48 bg-white/5 rounded-xl" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-8 w-32 bg-white/5 rounded-xl" />
              <Skeleton className="h-8 w-40 bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Info Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card/20 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 h-[350px]">
            <Skeleton className="h-8 w-48 mb-8 bg-white/10 rounded-xl" />
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-24 bg-white/5 rounded-md" />
                    <Skeleton className="h-5 w-48 bg-white/10 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card/20 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 h-[350px]">
            <Skeleton className="h-8 w-48 mb-8 bg-white/10 rounded-xl" />
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-24 bg-white/5 rounded-md" />
                    <Skeleton className="h-5 w-48 bg-white/10 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) return <div className="p-8 text-center text-muted-foreground">Error loading profile.</div>;

  return (
    <div className="space-y-8 w-full max-w-[1920px] mx-auto pb-12">
      
      {/* Top Banner Section */}
      <div 
        className="relative bg-card/40 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-8 border border-white/10 group"
        data-aos="fade-down"
      >
        {/* Decorative Animated Orbs - Isolated layer to prevent overflow-hidden border-radius animation glitch */}
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-125 transition-transform duration-700 transform-gpu" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-125 transition-transform duration-700 transform-gpu" />
        </div>

        {/* Edit Profile Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={openEditDialog}
          className="absolute top-6 right-6 z-20 gap-2 rounded-xl bg-background/40 backdrop-blur-md border-white/10 hover:bg-background/60"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit Profile
        </Button>

        {/* Avatar */}
        <div className="relative z-10 shrink-0">
          <div
            className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] overflow-hidden border-2 border-white/20 shadow-[0_0_30px_rgba(var(--primary),0.3)] bg-gradient-to-br from-primary/40 to-cyan-500/40 flex items-center justify-center relative group/avatar backdrop-blur-md cursor-pointer"
            onClick={openEditDialog}
          >
            {student.photo ? (
              <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-black text-white mix-blend-overlay opacity-80">{student.name.substring(0, 2).toUpperCase()}</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white/80" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="relative z-10 flex-1 text-center md:text-left space-y-4 w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Shield className="w-3.5 h-3.5" />
              Student ID: {student.student_id}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground drop-shadow-md">{student.name}</h1>
            <p className="text-lg md:text-xl text-primary font-medium mt-1 drop-shadow-sm">{student.batch?.course?.title} — {student.batch?.name}</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-sm font-medium text-muted-foreground">
            {student.phone && (
              <div className="flex items-center gap-2 bg-background/40 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-md">
                <Phone className="w-4 h-4 text-primary/70" /> {student.phone}
              </div>
            )}
            {student.email && (
              <div className="flex items-center gap-2 bg-background/40 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-md">
                <Mail className="w-4 h-4 text-primary/70" /> {student.email}
              </div>
            )}
            {student.dob && (
              <div className="flex items-center gap-2 bg-background/40 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-md">
                <Calendar className="w-4 h-4 text-primary/70" /> Born {format(new Date(student.dob), "PP")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Info Card */}
        <div 
          className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:bg-card/60 transition-colors"
          data-aos="fade-up"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/20 transition-all duration-300" />
          
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white relative z-10">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <User className="w-5 h-5" />
            </div>
            Personal Information
          </h2>
          
          <div className="space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5">
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 mb-1 sm:mb-0">Gender</div>
              <div className="font-semibold text-foreground capitalize text-lg">{student.gender || "Not specified"}</div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5">
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 mb-1 sm:mb-0">Date of Birth</div>
              <div className="font-semibold text-foreground text-lg">{student.dob ? format(new Date(student.dob), "MMMM d, yyyy") : "Not specified"}</div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5">
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 mb-1 sm:mb-0 flex items-center gap-1"><MapPin className="w-4 h-4"/> Address</div>
              <div className="font-semibold text-foreground text-lg text-right max-w-xs">{student.address || "Not specified"}</div>
            </div>
          </div>
        </div>

        {/* Guardian Info Card */}
        <div 
          className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:bg-card/60 transition-colors"
          data-aos="fade-up"
        >
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-300" />
          
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white relative z-10">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <Users className="w-5 h-5" />
            </div>
            Guardian Information
          </h2>
          
          <div className="space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5">
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 mb-1 sm:mb-0">Parent Name</div>
              <div className="font-semibold text-foreground text-lg">{student.parent_name || "Not specified"}</div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5">
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 mb-1 sm:mb-0">Relation</div>
              <div className="font-semibold text-foreground capitalize text-lg">{student.parent_relation || "Not specified"}</div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5">
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 mb-1 sm:mb-0 flex items-center gap-1"><Phone className="w-4 h-4"/> Parent Phone</div>
              <div className="font-semibold text-foreground text-lg">{student.parent_phone || "Not specified"}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Logout Button */}
      <div className="lg:hidden flex justify-center mt-8" data-aos="fade-up">
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full sm:w-auto rounded-2xl gap-2 font-bold py-6 bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:text-red-400 transition-all shadow-[0_0_20px_rgba(239,68,68,0.15)] group" 
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Log Out
        </Button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {editError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 font-medium">
                {editError}
              </div>
            )}

            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-border bg-gradient-to-br from-primary/40 to-cyan-500/40 flex items-center justify-center relative">
                {editPhoto ? (
                  <img src={editPhoto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-white mix-blend-overlay opacity-80">{editName.substring(0, 2).toUpperCase()}</span>
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-primary hover:underline">
                  {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                />
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editName">Full Name</Label>
              <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editAddress">Location / Address</Label>
              <Textarea id="editAddress" rows={3} value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Your address" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving || isUploadingPhoto}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
