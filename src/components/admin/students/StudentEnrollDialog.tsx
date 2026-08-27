"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Batch, Course, Student } from "./types";
import { siteConfig } from "@/config/site.config";

const DEFAULT_WELCOME_SMS =
  "Welcome {name} to {institute}! Your ID: {student_id}. Login with your phone number as password.";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <div
        className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!value ? "text-muted-foreground" : "text-foreground"}>
          {options.find((o) => o.value === value)?.label || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      {isOpen && (
        <div className="custom-scrollbar absolute top-full left-0 z-[100] mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {options.map((opt) => (
            <div
              key={opt.value}
              className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface StudentEnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  courses: Course[];
  batches: Batch[];
  onSaved: () => void;
}

export function StudentEnrollDialog({
  open,
  onOpenChange,
  student,
  courses,
  batches,
  onSaved,
}: StudentEnrollDialogProps) {
  const editingStudentId = student?.id ?? null;
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [student_id, setStudent_id] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDue, setPaymentDue] = useState("0");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [sendWelcomeSms, setSendWelcomeSms] = useState(true);
  const [welcomeSmsTemplate, setWelcomeSmsTemplate] = useState(DEFAULT_WELCOME_SMS);

  const resetForm = () => {
    setStudent_id("");
    setName("");
    setGender("");
    setDobDay("");
    setDobMonth("");
    setDobYear("");
    setPhone("");
    setEmail("");
    setPassword("");
    setSelectedCourseId("");
    setBatchId("");
    setParentName("");
    setParentPhone("");
    setAddress("");
    setPhoto("");
    setFormError("");
    setPaymentAmount("");
    setPaymentDue("0");
    setPaymentStatus("paid");
    setSendWelcomeSms(true);
    setWelcomeSmsTemplate(DEFAULT_WELCOME_SMS);
  };

  useEffect(() => {
    if (!open) return;
    if (!student) {
      resetForm();
      return;
    }
    setFormError("");
    setStudent_id(student.student_id || "");
    setName(student.name || "");
    setGender(student.gender || "");
    if (student.dob) {
      const d = new Date(student.dob).toISOString().split("T")[0];
      const parts = d.split("-");
      setDobYear(parts[0]);
      setDobMonth(parts[1]);
      setDobDay(parts[2]);
    } else {
      setDobDay("");
      setDobMonth("");
      setDobYear("");
    }
    setPhone(student.phone || "");
    setEmail(student.email || "");
    setPassword("");
    setSelectedCourseId(student.batch?.course?.id?.toString() || "");
    setBatchId(student.batch?.id?.toString() || "");
    setParentName(student.parent_name || "");
    setParentPhone(student.parent_phone || "");
    setAddress(student.address || "");
    setPhoto(student.photo || "");
  }, [open, student]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setFormError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload photo");
      setPhoto(data.url);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError("");
    setIsSubmitting(true);

    try {
      const url = editingStudentId
        ? `/api/admin/students/${editingStudentId}`
        : "/api/admin/students";
      const method = editingStudentId ? "PUT" : "POST";

      if (!dobYear || !dobMonth || !dobDay) {
        setFormError("Date of Birth is required");
        setIsSubmitting(false);
        return;
      }
      const dob = `${dobYear}-${dobMonth}-${dobDay}`;
      const payload: Record<string, string | number | boolean | undefined> = {
        student_id,
        name,
        gender,
        dob,
        phone,
        email,
        batch_id: batchId,
        parent_name: parentName,
        parent_phone: parentPhone,
        address,
        photo,
      };
      if (password) payload.password = password;

      if (!editingStudentId) {
        payload.payment_amount = paymentAmount;
        payload.payment_due = paymentDue;
        payload.payment_status = paymentStatus;
        payload.send_welcome_sms = sendWelcomeSms;
        const selectedCourseTitle =
          courses.find((c) => c.id.toString() === selectedCourseId)?.title || "our course";
        payload.welcome_sms_template = welcomeSmsTemplate
          .replace(/\{institute\}/gi, siteConfig.instituteName)
          .replace(/\{course\}/gi, selectedCourseTitle);
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${editingStudentId ? "update" : "create"} student`);
      }

      resetForm();
      onOpenChange(false);
      onSaved();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{editingStudentId ? "Edit Student" : "Enroll New Student"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">

          <div className="flex flex-col items-center gap-2">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="Student photo" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <label className="cursor-pointer">
              <span className="text-sm font-medium text-primary hover:underline">
                {isUploadingPhoto ? "Uploading..." : photo ? "Change Photo" : "Upload Photo"}
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="student_id">Student ID (Login ID)</Label>
              <Input
                id="student_id"
                value={student_id}
                onChange={(e) => setStudent_id(e.target.value)}
                required
                placeholder="e.g. 1001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <select
                id="course"
                className={selectClass}
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setBatchId("");
                }}
                required
              >
                <option value="">Select Course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <select
                id="batch"
                className={selectClass}
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
                disabled={!selectedCourseId}
              >
                <option value="">Select Batch...</option>
                {batches
                  .filter((b) => b.course?.id?.toString() === selectedCourseId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Student Phone (Password)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Custom Password (Optional){" "}
                {editingStudentId && (
                  <span className="text-xs text-muted-foreground">(Leave blank to keep current)</span>
                )}
              </Label>
              <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                className={selectClass}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <CustomDropdown
                  value={dobDay}
                  onChange={setDobDay}
                  placeholder="Day"
                  options={Array.from({ length: 31 }, (_, i) => {
                    const val = (i + 1).toString().padStart(2, "0");
                    return { value: val, label: val };
                  })}
                />
                <CustomDropdown
                  value={dobMonth}
                  onChange={setDobMonth}
                  placeholder="Month"
                  options={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                    (m, i) => ({
                      value: (i + 1).toString().padStart(2, "0"),
                      label: m,
                    })
                  )}
                />
                <CustomDropdown
                  value={dobYear}
                  onChange={setDobYear}
                  placeholder="Year"
                  options={Array.from({ length: 50 }, (_, i) => {
                    const y = (new Date().getFullYear() - i).toString();
                    return { value: y, label: y };
                  })}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="md:col-span-2 mt-2 border-t pt-4">
              <h3 className="mb-4 text-lg font-semibold text-primary">Parent Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parent_name">Parent Name (Optional)</Label>
                  <Input id="parent_name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent_phone" className="flex items-center justify-between">
                    <span>Parent Phone (Optional)</span>
                    <button
                      type="button"
                      onClick={() => setParentPhone(phone)}
                      className="text-xs text-primary hover:underline"
                    >
                      Copy Student Phone
                    </button>
                  </Label>
                  <Input id="parent_phone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>

          {!editingStudentId && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
                <h3 className="text-lg font-semibold">Initial Payment</h3>
                {(() => {
                  const course = courses.find((c) => c.id.toString() === selectedCourseId);
                  const courseFee = course?.discount_fee || course?.fee;

                  return (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                      {courseFee ? (
                        <div className="space-y-2">
                          <Label>Course Fee</Label>
                          <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                            ৳ {courseFee}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label className="italic text-muted-foreground">No fee defined for course</Label>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="pay_amount">Amount Paying (৳)</Label>
                        <Input
                          id="pay_amount"
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPaymentAmount(val);
                            if (courseFee) {
                              const p = parseFloat(val || "0");
                              const d = courseFee - p;
                              setPaymentDue(d > 0 ? d.toString() : "0");
                              setPaymentStatus(d > 0 ? (p > 0 ? "partial" : "due") : "paid");
                            }
                          }}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pay_due">Due Amount (৳)</Label>
                        <Input
                          id="pay_due"
                          type="number"
                          value={paymentDue}
                          onChange={(e) => setPaymentDue(e.target.value)}
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <select
                          className={selectClass}
                          value={paymentStatus}
                          onChange={(e) => setPaymentStatus(e.target.value)}
                        >
                          <option value="paid">Full Paid</option>
                          <option value="partial">Partial</option>
                          <option value="due">Unpaid</option>
                        </select>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="send_sms"
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    checked={sendWelcomeSms}
                    onChange={(e) => setSendWelcomeSms(e.target.checked)}
                  />
                  <Label htmlFor="send_sms" className="cursor-pointer text-base font-semibold">
                    Send Welcome SMS
                  </Label>
                </div>
                {sendWelcomeSms && (
                  <div className="space-y-2">
                    <Label>Message Template</Label>
                    <textarea
                      className="min-h-[80px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={welcomeSmsTemplate}
                      onChange={(e) => setWelcomeSmsTemplate(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Variables: {"{name}"}, {"{institute}"}, {"{student_id}"}, {"{course}"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t pt-4">
            {formError && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || isUploadingPhoto}>
                {isSubmitting
                  ? editingStudentId
                    ? "Saving..."
                    : "Enrolling..."
                  : editingStudentId
                    ? "Save Changes"
                    : "Enroll Student"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
