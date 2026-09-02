"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PublicMaterialClientProps {
  materialId: number;
  fileUrls: string[];
  collectLead: boolean;
  leadMandatory: boolean;
  leadFormMessage: string | null;
}

export function PublicMaterialClient({
  materialId,
  fileUrls,
  collectLead,
  leadMandatory,
  leadFormMessage
}: PublicMaterialClientProps) {
  const [showLeadForm, setShowLeadForm] = useState(collectLead);
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/public/materials/${materialId}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, study_level: classLevel })
      });
      
      if (res.ok) {
        setHasSubmittedLead(true);
        setShowLeadForm(false);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setShowLeadForm(false);
    setHasSubmittedLead(true);
  };

  if (collectLead && showLeadForm && !hasSubmittedLead) {
    return (
      <>
        <div className="flex justify-center p-8">
          <Button size="lg" onClick={() => setShowLeadForm(true)}>
            Unlock Material
          </Button>
        </div>

        <Dialog open={showLeadForm} onOpenChange={(open) => {
          if (!open && !leadMandatory) {
            setShowLeadForm(false);
          }
        }}>
          <DialogContent className="sm:max-w-[425px]" showCloseButton={!leadMandatory}>
            <DialogHeader>
              <DialogTitle>Almost there!</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {leadFormMessage || "Please enter your details to view this study material."}
              </p>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  required 
                  placeholder="Enter your name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                <Input 
                  id="phone" 
                  required 
                  placeholder="e.g. 01712345678" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class / Study Level (Optional)</Label>
                <Input 
                  id="class" 
                  placeholder="e.g. HSC 24, SSC 25, University" 
                  value={classLevel} 
                  onChange={(e) => setClassLevel(e.target.value)} 
                />
              </div>

              <div className="flex gap-3 pt-4">
                {!leadMandatory && (
                  <Button type="button" variant="outline" className="flex-1" onClick={handleSkip}>
                    Skip
                  </Button>
                )}
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit & View"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Show normal download buttons if no lead collection is required or if lead has been submitted
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {fileUrls.map((url, idx) => (
        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
          <Button size="lg" className="w-full sm:w-auto rounded-xl font-bold h-14 px-8 shadow-md">
            <Download className="w-5 h-5 mr-2" />
            ফাইল ডাউনলোড করুন {fileUrls.length > 1 ? idx + 1 : ''}
          </Button>
        </a>
      ))}
    </div>
  );
}
