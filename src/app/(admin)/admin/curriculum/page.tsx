"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Plus, BookOpen, Search, Trash2, Calendar as CalendarIcon, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import NCTBBookImporter from "@/components/admin/curriculum/NCTBBookImporter";

function statusLabel(status: string) {
  if (status === "active") return "চালু";
  if (status === "draft") return "খসড়া";
  return status;
}

export default function CurriculumListPage() {
  const [curricula, setCurricula] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCurricula = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/curriculum");
      if (res.ok) {
        const data = await res.json();
        setCurricula(data);
      }
    } catch (error) {
      console.error("Failed to fetch curricula:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurricula();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("এই কারিকুলাম মুছে ফেলতে চান? এটা আর ফেরত আনা যাবে না।")) return;

    try {
      const res = await fetch(`/api/admin/curriculum/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCurricula(curricula.filter((c) => c.id !== id));
      } else {
        alert("কারিকুলাম মুছা যায়নি। আবার চেষ্টা করুন।");
      }
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const filtered = curricula.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.course?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.batch?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-8" data-aos="fade-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-card/60 p-6 rounded-3xl border shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">কারিকুলাম রোডম্যাপ</h1>
          <p className="text-muted-foreground mt-1.5 font-medium">
            ক্লাস, পরীক্ষা আর ছুটির দিন সাজিয়ে নিন — তারপর স্টুডেন্টদের জন্য প্রকাশ করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <NCTBBookImporter onSuccess={fetchCurricula} />

          <Link href="/admin/curriculum/new">
            <Button className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 rounded-xl h-11 px-6">
              <Plus className="w-4 h-4" />
              নতুন কারিকুলাম
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          <Input
            placeholder="নাম, কোর্স বা ব্যাচ দিয়ে খুঁজুন…"
            className="pl-10 h-11 bg-card/50 backdrop-blur-sm shadow-sm border-muted-foreground/20 rounded-xl focus-visible:ring-primary/30 transition-all hover:bg-card/80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border-0 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="h-3 bg-muted w-full animate-pulse" />
                <div className="p-6 space-y-5">
                  <Skeleton className="h-7 w-3/4 rounded-md" />
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-full rounded-md opacity-70" />
                    <Skeleton className="h-5 w-5/6 rounded-md opacity-70" />
                    <Skeleton className="h-5 w-2/3 rounded-md opacity-70" />
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <Skeleton className="h-5 w-1/4 rounded-md" />
                    <Skeleton className="h-9 w-1/3 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card/40 border-dashed border-2 backdrop-blur-sm rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-5">
            <div className="p-5 bg-primary/10 rounded-full shadow-inner">
              <BookOpen className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">এখনো কোনো কারিকুলাম নেই</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                কোর্সের ক্লাস প্ল্যান বানাতে নতুন কারিকুলাম তৈরি করুন।
              </p>
            </div>
            <Link href="/admin/curriculum/new" className="mt-4">
              <Button className="rounded-xl px-8 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">কারিকুলাম তৈরি করুন</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((curriculum, i) => (
            <Card
              key={curriculum.id}
              className="group overflow-hidden flex flex-col border-0 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl"
              data-aos="fade-up"
              data-aos-delay={i * 50}
            >
              <div
                className={`h-2.5 w-full ${
                  curriculum.status === "active"
                    ? "bg-gradient-to-r from-primary/80 to-primary"
                    : curriculum.status === "draft"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500"
                      : "bg-muted-foreground"
                }`}
              />

              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-5 gap-2">
                  <div className="space-y-1.5 min-w-0">
                    <h3
                      className="font-bold text-xl leading-tight line-clamp-2"
                      title={curriculum.title}
                    >
                      {curriculum.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={curriculum.status === "active" ? "default" : "secondary"}
                        className={`text-[10px] h-5 rounded-md px-2 ${curriculum.status === "draft" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/50" : ""}`}
                      >
                        {statusLabel(curriculum.status)}
                      </Badge>
                      {curriculum.is_public && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 rounded-md border-blue-200/50 bg-blue-50/50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400"
                        >
                          স্টুডেন্ট দেখতে পারবে
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 rounded-full"
                    onClick={() => handleDelete(curriculum.id)}
                    title="কারিকুলাম মুছুন"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3 flex-1 mb-8">
                  <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground bg-muted/20 hover:bg-muted/40 transition-colors p-2.5 rounded-xl border border-muted/50">
                    <BookOpen className="w-4 h-4 shrink-0 text-primary/70" />
                    <span className="truncate">
                      {curriculum.course?.title || "কোর্স নেই"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground bg-muted/20 hover:bg-muted/40 transition-colors p-2.5 rounded-xl border border-muted/50">
                    <Users className="w-4 h-4 shrink-0 text-primary/70" />
                    <span className="truncate">
                      {curriculum.batch?.name || "ব্যাচ নেই"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground bg-muted/20 hover:bg-muted/40 transition-colors p-2.5 rounded-xl border border-muted/50">
                    <CalendarIcon className="w-4 h-4 shrink-0 text-primary/70" />
                    <span>
                      {format(parseISO(curriculum.start_date), "MMM d")} –{" "}
                      {format(parseISO(curriculum.end_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                <div className="pt-5 border-t border-border/40 flex items-center justify-between mt-auto">
                  <div className="text-sm font-medium text-muted-foreground flex flex-col">
                    <span className="text-xs">মোট ক্লাস</span>
                    <span className="text-lg text-foreground font-bold leading-none mt-0.5">{curriculum._count?.sessions || 0}</span>
                  </div>
                  <Link href={`/admin/curriculum/${curriculum.id}`}>
                    <Button
                      variant="outline"
                      className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all rounded-full px-5 shadow-sm"
                    >
                      প্ল্যানার খুলুন <CalendarIcon className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
