"use client";

import React, { useState, useEffect } from "react";
import { Plus, Video, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VideoCourseCard } from "@/components/admin/video-courses/VideoCourseCard";
import { VideoCourseDialog } from "@/components/admin/video-courses/VideoCourseDialog";
import { DemoClassesTab } from "@/components/admin/video-courses/DemoClassesTab";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type VideoCourse = {
  id: number;
  title: string;
  course?: { title: string };
  url: string;
  price: number;
  is_free: boolean;
  is_public: boolean;
  tags?: unknown;
  thumbnail?: string;
  description?: string;
};

export default function VideoCoursesPage() {
  const [activeTab, setActiveTab] = useState("courses");
  const [videoCourses, setVideoCourses] = useState<VideoCourse[]>([]);
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);
  const [batches, setBatches] = useState<{ id: number; name: string; course_id: number }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<VideoCourse | undefined>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vcRes, cRes, bRes] = await Promise.all([
        fetch("/api/admin/video-courses"),
        fetch("/api/admin/courses"),
        fetch("/api/admin/batches")
      ]);
      
      if (vcRes.ok) {
        setVideoCourses(await vcRes.json());
      }
      if (cRes.ok) {
        setCourses(await cRes.json());
      }
      if (bRes.ok) {
        const data = await bRes.json();
        setBatches(data.batches || data); // handle both array and paginated formats
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/video-courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete video course.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openAddDialog = () => {
    setSelectedCourse(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (course: VideoCourse) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const filteredCourses = videoCourses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.course?.title && c.course.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 p-4 sm:p-6" data-aos="fade-up">
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group" data-aos="fade-down">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
        
        <div className="relative z-10 flex-1">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">ভিডিও কোর্স ছাড়তে চাইলে শিক্ষ ভূমির সাথে যুক্ত হোন!</h2>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl leading-relaxed">
            সম্পূর্ণ ফ্রি তে ভিডিও কোর্স ছাড়তে পারবেন এবং সেটা আপনার সাইটে ব্যবহার করে অনায়াসে সেল করতে পারবেন। আজই শিক্ষ ভূমিতে যুক্ত হোন এবং আপনার কোর্সের প্রসার বাড়ান।
          </p>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <Button 
            onClick={() => window.open("https://shikkhabhumi.com", "_blank")} 
            size="lg" 
            className="w-full md:w-auto whitespace-nowrap font-bold bg-white text-indigo-700 hover:bg-gray-100 hover:scale-105 transition-all shadow-lg shadow-black/10"
          >
            shikkhabhumi.com
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" data-aos="fade-down" data-aos-delay="100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Video className="h-8 w-8 text-primary" />
            Video Content
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your video library, assign to courses, and add demo classes for the homepage.
          </p>
        </div>
      </div>

      <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg max-w-sm w-full gap-1 mb-6 overflow-x-auto hide-scrollbar" data-aos="fade-up" data-aos-delay="150">
        <button
          onClick={() => setActiveTab("courses")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
            activeTab === "courses" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Video Courses
        </button>
        <button
          onClick={() => setActiveTab("demo")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
            activeTab === "demo" ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Demo Classes
        </button>
      </div>
        
      {activeTab === "courses" && (
        <div className="space-y-6" data-aos="fade-up" data-aos-delay="200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by title or course..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={openAddDialog} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Video Course
            </Button>
          </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col gap-2 p-4 border rounded-xl shadow-sm">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-6 w-3/4 mt-2" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-card border rounded-xl shadow-sm">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium">No video courses found</h3>
          <p className="text-muted-foreground mt-2 mb-6">Create your first video course to start sharing content.</p>
          <Button onClick={openAddDialog}>Add Video Course</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <VideoCourseCard 
              key={course.id} 
              course={course} 
              onEdit={openEditDialog} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}

      <VideoCourseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        videoCourse={selectedCourse}
        courses={courses}
        batches={batches}
        onSaved={fetchData}
      />
      </div>
      )}

      {activeTab === "demo" && (
        <DemoClassesTab />
      )}
    </div>
  );
}
