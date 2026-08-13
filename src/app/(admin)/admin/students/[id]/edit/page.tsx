"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, User, Upload, ArrowLeft, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Course {
  id: number;
  title: string;
  fee?: number | null;
  discount_fee?: number | null;
}

interface Batch {
  id: number;
  name: string;
  year: string;
  course: Course;
}

const CustomDropdown = ({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[], placeholder: string }) => {
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
        className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!value ? "text-muted-foreground" : "text-foreground font-medium"}>
          {options.find(o => o.value === value)?.label || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-xl z-[100] custom-scrollbar">
          {options.map((opt) => (
            <div
              key={opt.value}
              className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-primary/10 hover:text-primary transition-colors font-medium"
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
};

export default function AddStudentPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: number; name: string } | null>(null);

  // Fields
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

  // Enrollment Payment & SMS Fields
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDue, setPaymentDue] = useState("0");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [sendWelcomeSms, setSendWelcomeSms] = useState(true);
  const [welcomeSmsTemplate, setWelcomeSmsTemplate] = useState("Welcome {name} to {course}! Log in at https://institute.app");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batRes, couRes] = await Promise.all([
        fetch("/api/admin/batches"),
        fetch("/api/admin/courses")
      ]);

      if (batRes.ok) setBatches(await batRes.json());
      if (couRes.ok) setCourses(await couRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      if (!dobYear || !dobMonth || !dobDay) {
        setFormError("Date of Birth is required");
        setIsSubmitting(false);
        return;
      }
      const dob = `${dobYear}-${dobMonth}-${dobDay}`;
      const payload: Record<string, string | number | boolean | undefined> = {
        student_id, name, gender, dob, phone, email, batch_id: batchId,
        parent_name: parentName, parent_phone: parentPhone, address, photo
      };
      if (password) payload.password = password;

      payload.payment_amount = paymentAmount;
      payload.payment_due = paymentDue;
      payload.payment_status = paymentStatus;
      payload.send_welcome_sms = sendWelcomeSms;
      const selectedCourseTitle = courses.find(c => c.id.toString() === selectedCourseId)?.title || "our course";
      payload.welcome_sms_template = welcomeSmsTemplate.replace(/{course}/g, selectedCourseTitle);

      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create student");

      if (data.data) {
        setSuccessData(data.data);
      } else {
        router.push("/admin/students");
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="border-none shadow-2xl">
          <CardContent className="pt-12 pb-12 flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-foreground mb-2">Enrollment Successful!</h2>
              <p className="text-muted-foreground text-lg">
                <strong>{successData.name}</strong> has been enrolled successfully.
              </p>
            </div>
            <div className="flex gap-4 w-full max-w-sm pt-6">
              <Button variant="outline" className="w-full" onClick={() => router.push("/admin/students")}>
                Done
              </Button>
              <Button className="w-full bg-primary" onClick={() => router.push("/admin/payments")}>
                Process Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/students">
          <Button variant="outline" size="icon" className="rounded-full w-10 h-10 shadow-sm hover:shadow-md transition-shadow">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Student</h1>
          <p className="text-muted-foreground mt-1 text-sm">Enroll a new student to a course and batch.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {formError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200 flex items-center gap-3 font-medium shadow-sm">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {formError}
          </div>
        )}

        {/* Basic Information */}
        <Card className="border-none shadow-lg overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-primary" /> Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-3 flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center relative group hover:border-primary/50 transition-colors shadow-sm">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Upload className="w-8 h-8 mb-2 opacity-50 group-hover:text-primary transition-colors" />
                    <span className="text-xs font-medium">Upload Photo</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-sm font-semibold animate-pulse text-primary">Uploading...</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">Square image recommended (Max 2MB)</p>
            </div>

            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground/80 font-semibold">Full Name <span className="text-red-500">*</span></Label>
                <Input id="name" className="h-11 bg-muted/20 hover:bg-muted/40 transition-colors focus-visible:bg-background shadow-sm" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Rakibul Islam" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_id" className="text-foreground/80 font-semibold">Student ID (Login ID) <span className="text-red-500">*</span></Label>
                <Input id="student_id" className="h-11 bg-muted/20 hover:bg-muted/40 transition-colors focus-visible:bg-background shadow-sm" value={student_id} onChange={(e) => setStudent_id(e.target.value)} required placeholder="e.g. 1001" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground/80 font-semibold">Phone Number (Default Password) <span className="text-red-500">*</span></Label>
                <Input id="phone" type="tel" className="h-11 bg-muted/20 hover:bg-muted/40 transition-colors focus-visible:bg-background shadow-sm" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="e.g. 017XXXXXXXX" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80 font-semibold">Email Address (Optional)</Label>
                <Input id="email" type="email" className="h-11 bg-muted/20 hover:bg-muted/40 transition-colors focus-visible:bg-background shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. user@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-foreground/80 font-semibold">Gender <span className="text-red-500">*</span></Label>
                <select
                  id="gender"
                  className="flex h-11 w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent hover:border-primary/50 transition-colors cursor-pointer font-medium shadow-sm"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80 font-semibold">Date of Birth <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-3 gap-3">
                  <CustomDropdown
                    value={dobDay}
                    onChange={setDobDay}
                    placeholder="Day"
                    options={Array.from({ length: 31 }, (_, i) => {
                      const val = (i + 1).toString().padStart(2, '0');
                      return { value: val, label: val };
                    })}
                  />
                  <CustomDropdown
                    value={dobMonth}
                    onChange={setDobMonth}
                    placeholder="Month"
                    options={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => ({
                      value: (i + 1).toString().padStart(2, '0'), label: m
                    }))}
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
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Details */}
        <Card className="border-none shadow-lg overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Building2 className="w-5 h-5 text-primary" /> Enrollment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="course" className="text-foreground/80 font-semibold">Select Course <span className="text-red-500">*</span></Label>
              <select
                id="course"
                className="flex h-11 w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent hover:border-primary/50 transition-colors cursor-pointer font-medium shadow-sm"
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setBatchId("");
                  // Update payment details automatically
                  const course = courses.find(c => c.id.toString() === e.target.value);
                  if (course) {
                    const fee = course.discount_fee || course.fee || 0;
                    setPaymentDue(fee.toString());
                  } else {
                    setPaymentDue("0");
                  }
                  setPaymentAmount("");
                  setPaymentStatus("due");
                }}
                required
              >
                <option value="" disabled>Choose a course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch" className="text-foreground/80 font-semibold">Select Batch <span className="text-red-500">*</span></Label>
              <select
                id="batch"
                className="flex h-11 w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent hover:border-primary/50 transition-colors disabled:opacity-50 cursor-pointer font-medium shadow-sm"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
                disabled={!selectedCourseId}
              >
                <option value="" disabled>Choose a batch...</option>
                {batches.filter(b => b.course?.id?.toString() === selectedCourseId).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80 font-semibold">Custom Password (Optional)</Label>
              <Input id="password" type="text" className="h-11 bg-muted/20 hover:bg-muted/40 transition-colors focus-visible:bg-background shadow-sm" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to use phone number" />
            </div>
          </CardContent>
        </Card>

        {/* Parent & Address */}
        <Card className="border-none shadow-lg overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-primary" /> Guardian & Address
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="parent_name" className="text-foreground/80 font-semibold">Parent/Guardian Name</Label>
              <Input id="parent_name" className="h-11 bg-muted/20 hover:bg-muted/40 transition-colors focus-visible:bg-background shadow-sm" value={parentName} onChange={(e) => setParentName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_phone" className="text-foreground/80 font-semibold flex items-center justify-between">
                <span>Parent Phone</span>
                <button
                  type="button"
                  onClick={() => setParentPhone(phone)}
                  className="text-xs text-primary hover:underline font-bold"
                >
                  Copy Student Phone
                </button>
              </Label>
              <Input id="parent_phone" type="tel" className="h-11 bg-muted/20 hover:bg-muted/40 transition-colors focus-visible:bg-background shadow-sm" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address" className="text-foreground/80 font-semibold">Full Address</Label>
              <Input id="address" className="h-11 bg-muted/20 hover:bg-muted/40 transition-colors focus-visible:bg-background shadow-sm" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House, Street, Area, City" />
            </div>
          </CardContent>
        </Card>

        {/* Payment & SMS (Visible only when course is selected) */}
        {selectedCourseId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400">Initial Payment</CardTitle>
                <CardDescription>Process the admission fee right away.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {(() => {
                  const course = courses.find(c => c.id.toString() === selectedCourseId);
                  const courseFee = course?.discount_fee || course?.fee || 0;

                  return (
                    <>
                      <div className="flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm rounded-xl border border-emerald-500/20 shadow-sm">
                        <span className="font-semibold text-muted-foreground">Course Fee</span>
                        <span className="text-2xl font-black text-emerald-600">৳ {courseFee}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pay_amount" className="font-semibold">Amount Paying Now</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">৳</span>
                            <Input
                              id="pay_amount"
                              type="number"
                              className="h-11 pl-8 bg-background border-emerald-500/30 focus-visible:ring-emerald-500 shadow-sm font-bold text-lg"
                              value={paymentAmount}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPaymentAmount(val);
                                const p = parseFloat(val || "0");
                                const d = courseFee - p;
                                setPaymentDue(d > 0 ? d.toString() : "0");
                                setPaymentStatus(d > 0 ? (p > 0 ? "partial" : "due") : "paid");
                              }}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pay_due" className="font-semibold">Due Amount</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">৳</span>
                            <Input
                              id="pay_due"
                              type="number"
                              className="h-11 pl-8 bg-background/50 text-rose-600 font-bold border-rose-500/20 shadow-sm text-lg"
                              value={paymentDue}
                              onChange={(e) => setPaymentDue(e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold">Payment Status</Label>
                        <select
                          className="flex h-11 w-full rounded-md border border-emerald-500/30 bg-background px-3 py-2 text-sm ring-offset-background font-semibold text-emerald-700 shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent"
                          value={paymentStatus}
                          onChange={(e) => setPaymentStatus(e.target.value)}
                        >
                          <option value="paid">✅ Full Paid</option>
                          <option value="partial">⏳ Partial Payment</option>
                          <option value="due">❌ Unpaid / Due</option>
                        </select>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-blue-700 dark:text-blue-400">Welcome SMS</CardTitle>
                <CardDescription>Send a welcome text message with login details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-3 p-4 bg-background/80 backdrop-blur-sm rounded-xl border border-blue-500/20 shadow-sm">
                  <input
                    type="checkbox"
                    id="send_sms"
                    className="h-5 w-5 rounded-md border-blue-300 text-blue-600 focus:ring-blue-500"
                    checked={sendWelcomeSms}
                    onChange={(e) => setSendWelcomeSms(e.target.checked)}
                  />
                  <Label htmlFor="send_sms" className="text-base font-semibold cursor-pointer select-none">Send Welcome SMS to Student</Label>
                </div>

                {sendWelcomeSms && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label className="font-semibold">Message Template</Label>
                    <textarea
                      className="flex w-full rounded-xl border border-blue-500/30 bg-background p-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[120px] resize-none leading-relaxed shadow-sm font-medium"
                      value={welcomeSmsTemplate}
                      onChange={(e) => setWelcomeSmsTemplate(e.target.value)}
                    />
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      <span className="font-semibold">Available Variables:</span>
                      <span className="px-1.5 py-0.5 bg-muted rounded font-mono text-primary">{'{name}'}</span>
                      <span className="px-1.5 py-0.5 bg-muted rounded font-mono text-primary">{'{course}'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-border/40">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto px-12 h-14 text-base font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
            disabled={isSubmitting || isUploadingPhoto || loading}
          >
            {isSubmitting ? "Processing Enrollment..." : "Enroll Student"}
          </Button>
        </div>
      </form>
    </div>
  );
}
