import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Download, ShieldCheck, CheckCircle2, Calendar } from "lucide-react";
import { Metadata } from "next";
import { PublicMaterialClient } from "./PublicMaterialClient";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = parseInt(params.id);
  if (isNaN(id)) return { title: "Not Found" };

  const material = await prisma.noteMaterial.findUnique({
    where: { id },
    include: {
      course: { select: { title: true } },
      batch: { select: { name: true, course: { select: { title: true } } } }
    }
  });

  if (!material || !material.is_public || material.status !== 'active') {
    return { title: "Not Found" };
  }

  return {
    title: `${material.title} - ফ্রি ম্যাটেরিয়াল`,
    description: material.description || "ফ্রি স্টাডি ম্যাটেরিয়াল ডাউনলোড করুন।",
  };
}

export default async function PublicMaterialPage({ params }: PageProps) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const material = await prisma.noteMaterial.findUnique({
    where: { id },
    include: {
      course: { select: { title: true } },
      batch: { select: { name: true, course: { select: { title: true } } } }
    }
  });

  if (!material || !material.is_public || material.status !== 'active') {
    notFound();
  }

  let fileUrls: string[] = [];
  try {
    const parsed = JSON.parse(material.file_path);
    if (Array.isArray(parsed)) {
      fileUrls = parsed;
    } else {
      fileUrls = [material.file_path];
    }
  } catch {
    fileUrls = [material.file_path];
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-primary">ফ্রি {material.type === 'book' ? 'বই' : 'স্টাডি নোট'}</span>
                <p className="text-xs text-muted-foreground">অ্যাডমিন কর্তৃক প্রকাশিত</p>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2 leading-tight">
              {material.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
              {(material.course || material.batch?.course) && (
                <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                  কোর্স: {material.course?.title || material.batch?.course?.title}
                </span>
              )}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>প্রকাশিত: {new Date(material.created_at).toLocaleDateString('en-GB', { dateStyle: 'long' })}</span>
              </div>
            </div>
            
            {material.description && (
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl leading-relaxed">
                {material.description}
              </p>
            )}

            <PublicMaterialClient 
              materialId={material.id} 
              fileUrls={fileUrls} 
              collectLead={material.collect_lead}
              leadMandatory={material.lead_mandatory}
              leadFormMessage={material.lead_form_message}
            />
          </div>
        </div>

        {/* Marketing / Upsell Section */}
        <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-md relative overflow-hidden border border-slate-800">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                আরও প্রিমিয়াম স্টাডি ম্যাটেরিয়াল চান?
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                আমাদের প্রিমিয়াম কোর্সে ভর্তি হয়ে সকল লেকচার, এক্সক্লুসিভ নোট, লাইভ ক্লাস এবং সার্বক্ষণিক মেন্টরিং-এর সুবিধা গ্রহণ করুন।
              </p>
              <ul className="space-y-3">
                {[
                  "সম্পূর্ণ সিলেবাস কভারেজ",
                  "সাপ্তাহিক লাইভ ডাউট-সলভিং সেশন",
                  "প্রিমিয়াম মক টেস্ট দেওয়ার সুযোগ"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-200 font-medium text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="w-full md:w-auto bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
              <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">প্রস্তুতি শুরু করতে চান?</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-[200px] mx-auto">আজই সফল শিক্ষার্থীদের সাথে যুক্ত হোন।</p>
              <Link href="/courses">
                <Button size="lg" className="w-full rounded-xl font-bold hover:scale-105 transition-transform bg-primary hover:bg-primary/90">
                  এখনই ভর্তি হোন
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
