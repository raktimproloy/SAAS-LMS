"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Loader2, CheckCircle2, Download, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const CLASSES_DATA = [
  {
    name: "Class 6",
    subjects: ["Bangla", "English", "Mathematics", "Science", "History and Social Science", "Digital Technology", "Health and Wellbeing", "Life and Livelihood", "Islamic Studies", "Hindu Studies"]
  },
  {
    name: "Class 7",
    subjects: ["Bangla", "English", "Mathematics", "Science", "History and Social Science", "Digital Technology", "Health and Wellbeing", "Life and Livelihood", "Islamic Studies", "Hindu Studies"]
  },
  {
    name: "Class 8",
    subjects: ["Bangla", "English", "Mathematics", "Science", "History and Social Science", "Digital Technology", "Health and Wellbeing", "Life and Livelihood", "Islamic Studies", "Hindu Studies"]
  },
  {
    name: "Class 9",
    subjects: ["Bangla", "English", "Mathematics", "Science", "History and Social Science", "Digital Technology", "Health and Wellbeing", "Life and Livelihood", "Islamic Studies", "Hindu Studies"]
  },
  {
    name: "Class 10",
    subjects: ["Bangla", "English", "Mathematics", "Physics", "Chemistry", "Biology", "Higher Mathematics", "Accounting", "Finance & Banking", "Business Ent.", "Geography", "Economics", "History", "Civics", "Islamic Studies", "Hindu Studies"]
  },
  {
    name: "HSC (Class 11-12)",
    subjects: ["Bangla", "English", "Physics 1st Paper", "Physics 2nd Paper", "Chemistry 1st Paper", "Chemistry 2nd Paper", "Biology 1st Paper", "Biology 2nd Paper", "Higher Math 1st Paper", "Higher Math 2nd Paper", "Accounting", "Business Org", "Finance", "Economics", "Civics", "History", "Logic", "Islamic History", "Islamic Studies", "ICT"]
  }
];

interface NCTBBookImporterProps {
  onSuccess?: () => void;
}

export default function NCTBBookImporter({ onSuccess }: NCTBBookImporterProps) {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [section, setSection] = useState("General"); // Default section
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const availableSubjects = CLASSES_DATA.find(c => c.name === className)?.subjects || [];

  const downloadFormat = () => {
    const format = [
      {
        "name": "Chapter 1: Real Numbers", 
        "size": 2,
        "topics": [
          { "name": "Rational Numbers", "size": 1 },
          { "name": "Irrational Numbers", "size": 1 }
        ]
      }
    ];
    const blob = new Blob([JSON.stringify(format, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "curriculum_format.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "ডাউনলোড হয়েছে",
      description: "নমুনা JSON ফরম্যাট ফাইল ডাউনলোড হয়েছে।",
    });
  };

  const handleImport = async () => {
    if (!className || !subject || !jsonInput) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "ক্লাস ও বিষয় সিলেক্ট করে JSON পেস্ট করুন।",
        variant: "destructive"
      });
      return;
    }

    let parsedChapters = [];
    try {
      parsedChapters = JSON.parse(jsonInput);
      if (!Array.isArray(parsedChapters)) {
        throw new Error("JSON must be an array of chapters");
      }
    } catch (e) {
      toast({
        title: "ভুল JSON",
        description: "সঠিক JSON পেস্ট করেছেন কিনা দেখুন।",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/nctb-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_name: className,
          section: section,
          subject: subject,
          chapters: parsedChapters,
        }),
      });

      if (!res.ok) throw new Error("Failed to import book");

      toast({
        title: "সফল হয়েছে",
        description: `${className} - ${subject} ইমপোর্ট হয়েছে।`,
      });
      
      setJsonInput("");
      setClassName("");
      setSubject("");
      setIsOpen(false);
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      toast({
        title: "সমস্যা হয়েছে",
        description: "বই ইমপোর্ট হয়নি। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
          <Upload className="w-4 h-4 text-primary" />
          কারিকুলাম JSON ইমপোর্ট
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mt-2">
            <div>
              <DialogTitle>কারিকুলাম ডেটাবেস ইমপোর্ট</DialogTitle>
              <DialogDescription>
                ক্লাস ও বিষয় সিলেক্ট করে JSON ইমপোর্ট করুন।
              </DialogDescription>
            </div>
            <Button size="sm" variant="outline" onClick={downloadFormat} className="h-8 text-xs gap-1">
              <Download className="w-3 h-3" /> ফরম্যাট ডাউনলোড
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              ধাপ ১: ক্লাস ও বিষয় সিলেক্ট করুন
            </h4>
            
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label className="text-xs">ক্লাসের নাম</Label>
                <Select value={className || undefined} onValueChange={(val) => { setClassName(val || ""); setSubject(""); }}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="ক্লাস সিলেক্ট করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES_DATA.map((cls) => (
                      <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">বিষয়</Label>
                <Select value={subject || undefined} onValueChange={(val) => setSubject(val || "")} disabled={!className}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="বিষয় সিলেক্ট করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              ধাপ ২: JSON ডেটা পেস্ট করুন
            </h4>

            <div className="space-y-2">
              <Textarea 
                placeholder='[\n  {\n    "name": "Chapter 1: Real Numbers",\n    "size": 2,\n    "topics": [\n      { "name": "Rational Numbers", "size": 1 }\n    ]\n  }\n]'
                className="font-mono text-xs min-h-[250px] bg-muted/10"
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>বাতিল</Button>
          <Button onClick={handleImport} disabled={isSubmitting || !className || !subject || !jsonInput}>
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> ইমপোর্ট হচ্ছে...</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> কারিকুলাম ইমপোর্ট</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
