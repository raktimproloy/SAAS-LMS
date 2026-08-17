"use client";

import { Mail, MapPin, Phone, UserRound, CalendarDays } from "lucide-react";
import type { Student } from "./types";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm text-foreground">{value?.trim() || "—"}</p>
    </div>
  );
}

export function StudentExpandedRow({ student }: { student: Student }) {
  const dob = student.dob
    ? new Date(student.dob).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : null;
  const enrolled = student.enrolled_at
    ? new Date(student.enrolled_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="bg-muted/40 px-4 py-4 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-2.5">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="grid min-w-0 flex-1 gap-3">
            <Field label="Parent" value={student.parent_name} />
            <Field label="Parent phone" value={student.parent_phone} />
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="grid min-w-0 flex-1 gap-3">
            <Field label="Student phone" value={student.phone} />
            <Field label="Gender" value={student.gender} />
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="grid min-w-0 flex-1 gap-3">
            <Field label="Email" value={student.email} />
            <Field label="Date of birth" value={dob} />
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="grid min-w-0 flex-1 gap-3">
            <Field label="Address" value={student.address} />
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                Enrolled
              </p>
              <p className="mt-0.5 truncate text-sm text-foreground">{enrolled || "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
