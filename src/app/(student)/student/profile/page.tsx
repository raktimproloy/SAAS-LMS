"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Phone, MapPin, Mail, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

export default function StudentProfile() {
  const [student, setStudent] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/me')
      .then(res => res.json())
      .then(data => {
        setStudent(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-pulse h-8 w-32 bg-slate-200 rounded"></div></div>;
  }

  if (!student) return <div className="p-8">Error loading profile.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-card text-card-foreground p-8 rounded-2xl border shadow-sm">
        <Avatar className="w-32 h-32 border-4 border-background shadow-md">
          <AvatarImage src={student.photo || ""} />
          <AvatarFallback className="text-4xl">{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-2">
            Student ID: {student.student_id}
          </div>
          <h1 className="text-3xl font-bold text-foreground">{student.name}</h1>
          <p className="text-lg text-muted-foreground">{student.batch?.course?.title} — {student.batch?.name}</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4 text-sm text-muted-foreground">
            {student.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {student.phone}
              </div>
            )}
            {student.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> {student.email}
              </div>
            )}
            {student.dob && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Born {format(new Date(student.dob), "PP")}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground/70" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 border-b pb-3">
              <div className="text-sm text-muted-foreground">Gender</div>
              <div className="col-span-2 font-medium capitalize">{student.gender || "Not specified"}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b pb-3">
              <div className="text-sm text-muted-foreground">Date of Birth</div>
              <div className="col-span-2 font-medium">{student.dob ? format(new Date(student.dob), "MMMM d, yyyy") : "Not specified"}</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4"/> Address</div>
              <div className="col-span-2 font-medium">{student.address || "Not specified"}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground/70" />
              Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 border-b pb-3">
              <div className="text-sm text-muted-foreground">Parent Name</div>
              <div className="col-span-2 font-medium">{student.parent_name || "Not specified"}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b pb-3">
              <div className="text-sm text-muted-foreground">Relation</div>
              <div className="col-span-2 font-medium capitalize">{student.parent_relation || "Not specified"}</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4"/> Parent Phone</div>
              <div className="col-span-2 font-medium">{student.parent_phone || "Not specified"}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
