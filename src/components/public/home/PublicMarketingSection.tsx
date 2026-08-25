"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, ChevronRight, Calendar, Clock } from "lucide-react";

import { useState, useEffect } from "react";

export function PublicMarketingSection({ publicExams, publicMaterials }: { publicExams: any[], publicMaterials: any[] }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  if (publicExams.length === 0 && publicMaterials.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-primary font-bold tracking-wider uppercase text-sm">ফ্রি রিসোর্স</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-3 mb-4">
            বিনামূল্যে আপনার প্রস্তুতি যাচাই করুন
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            আমাদের ফ্রি মক টেস্ট দিয়ে নিজেকে যাচাই করুন অথবা ফ্রি স্টাডি ম্যাটেরিয়াল ডাউনলোড করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Public Exams */}
          {publicExams.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="p-2 bg-primary/10 text-primary rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  ফ্রি মক টেস্ট
                </h3>
              </div>
              <div className="grid gap-4">
                {publicExams.map(exam => (
                  <div key={exam.id} className="bg-white dark:bg-slate-950 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                          {exam.title}
                        </h4>
                        {(exam.course || exam.batch?.course) && (
                          <p className="text-xs text-primary mb-2 font-medium">
                            কোর্স: {exam.course?.title || exam.batch?.course?.title}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium mb-3">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exam.duration_minutes} মিনিট</span>
                          <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {exam.total_marks} মার্কস</span>
                        </div>
                        {(exam.start_time || exam.end_time) && (
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                            {exam.start_time && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Calendar className="w-3.5 h-3.5 text-primary/70" />
                                <span><span className="font-semibold">শুরু:</span> {new Date(exam.start_time).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              </div>
                            )}
                            {exam.end_time && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Clock className="w-3.5 h-3.5 text-rose-500/70" />
                                <span><span className="font-semibold">শেষ:</span> {new Date(exam.end_time).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                        {(() => {
                          if (!now) return (
                            <Button disabled className="w-full sm:w-auto rounded-lg font-semibold bg-slate-200 text-slate-400">
                              অপেক্ষা করুন...
                            </Button>
                          );
                          
                          const hasStarted = !exam.start_time || new Date(exam.start_time) <= now;
                          const hasEnded = exam.end_time && new Date(exam.end_time) < now;

                          if (!hasStarted) {
                            return (
                              <Button disabled className="w-full sm:w-auto rounded-lg font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                এখনো শুরু হয়নি
                              </Button>
                            );
                          }

                          if (hasEnded) {
                            return (
                              <Button disabled className="w-full sm:w-auto rounded-lg font-semibold bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                                সময় শেষ
                              </Button>
                            );
                          }

                          return (
                            <Link href={`/exams/${exam.id}`}>
                              <Button className="w-full sm:w-auto rounded-lg font-semibold bg-primary hover:bg-primary/90 text-white">
                                বিস্তারিত ও পরীক্ষা <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          );
                        })()}
                      </div>
                    </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Materials */}
          {publicMaterials.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="p-2 bg-primary/10 text-primary rounded-lg">
                    <FileText className="w-5 h-5" />
                  </span>
                  ফ্রি স্টাডি ম্যাটেরিয়াল
                </h3>
              </div>
              <div className="grid gap-4">
                {publicMaterials.map(mat => (
                  <div key={mat.id} className="bg-white dark:bg-slate-950 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                          {mat.title}
                        </h4>
                        {(mat.course || mat.batch?.course) && (
                          <p className="text-xs text-primary mb-1.5 font-medium">
                            কোর্স: {mat.course?.title || mat.batch?.course?.title}
                          </p>
                        )}
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{mat.description || "ফ্রি ম্যাটেরিয়াল ডাউনলোড করুন"}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 w-fit px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>প্রকাশিত: {new Date(mat.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
                        </div>
                      </div>
                      <Link href={`/materials/${mat.id}`}>
                        <Button variant="outline" className="w-full sm:w-auto rounded-lg font-semibold text-primary border-primary/20 hover:bg-primary/5">
                          দেখুন ও ডাউনলোড করুন
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
