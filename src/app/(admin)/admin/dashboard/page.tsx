import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, CreditCard, Activity, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import prisma from "@/lib/db";
import { format } from "date-fns";
import { CurriculumClassStrip } from "@/components/admin/dashboard/CurriculumClassStrip";

export default async function AdminDashboard() {
  const [totalStudents, activeBatches, activeExams] = await Promise.all([
    prisma.student.count(),
    prisma.batch.count({ where: { status: "active" } }),
    prisma.exam.count({ where: { status: "active" } }),
  ]);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const thisMonthPayments = await prisma.payment.aggregate({
    where: {
      month: currentMonth,
      year: currentYear,
      status: "paid",
    },
    _sum: {
      amount: true,
    },
  });

  const totalRevenue = thisMonthPayments._sum.amount || 0;

  const recentStudentsData = await prisma.student.findMany({
    take: 5,
    orderBy: { created_at: "desc" },
    include: {
      batch: true,
      payments: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });

  const upcomingExamsData = await prisma.exam.findMany({
    where: { start_time: { gt: new Date() }, status: "active" },
    take: 5,
    orderBy: { start_time: "asc" },
    include: { batch: true, course: true },
  });

  const stats = [
    {
      title: "Total Students",
      value: totalStudents.toLocaleString(),
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active Batches",
      value: activeBatches.toLocaleString(),
      icon: GraduationCap,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Revenue (This Month)",
      value: `৳ ${totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Active Exams",
      value: activeExams.toLocaleString(),
      icon: Activity,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8" data-aos="fade-up">
      <div data-aos="fade-down" className="flex flex-col gap-1.5 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base font-medium">
          Overview of your institute&apos;s performance and today&apos;s classes.
        </p>
        <div className="absolute -z-10 top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <CurriculumClassStrip />

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="group relative overflow-hidden border border-border/40 bg-gradient-to-br from-card to-card/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1"
            data-aos="fade-up"
            data-aos-delay={i * 100}
          >
            {/* Subtle background glow effect on hover */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${stat.bg.replace('/10', '')}`} />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold text-muted-foreground tracking-wide">{stat.title}</CardTitle>
              <div className={`p-2.5 rounded-xl ${stat.bg} ring-1 ring-inset ring-foreground/5 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-2">
              <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card
          className="col-span-4 border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card/80 backdrop-blur-xl relative overflow-hidden group/card"
          data-aos="fade-right"
          data-aos-delay="400"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-4 border-b border-border/30">
            <CardTitle className="text-lg font-bold">Recent Admissions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground py-3 pl-4 sm:pl-6">ID</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground py-3">Name</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground py-3">Batch</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground py-3">Date</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground py-3 text-right pr-4 sm:pr-6">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentStudentsData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                        No admissions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentStudentsData.map((student) => {
                      const status =
                        student.payments.length > 0 ? student.payments[0].status : "Pending";
                      return (
                        <TableRow key={student.id} className="group/row hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0">
                          <TableCell className="font-semibold text-sm pl-4 sm:pl-6">{student.student_id}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-secondary-foreground whitespace-nowrap">
                              {student.batch?.name}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                            {format(new Date(student.created_at), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell className="text-right pr-4 sm:pr-6">
                            <Badge
                              variant={status.toLowerCase() === "paid" ? "default" : "destructive"}
                              className={`capitalize text-[10px] sm:text-xs font-bold shadow-sm ${
                                status.toLowerCase() === "paid" 
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20" 
                                  : "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20"
                              }`}
                            >
                              {status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card
          className="col-span-3 border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card/80 backdrop-blur-xl relative overflow-hidden group/card2"
          data-aos="fade-left"
          data-aos-delay="500"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent opacity-0 group-hover/card2:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-4 border-b border-border/30">
            <CardTitle className="text-lg font-bold">Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="space-y-4">
              {upcomingExamsData.length === 0 ? (
                <div className="text-center text-muted-foreground py-6 border rounded-lg border-dashed">
                  No upcoming exams
                </div>
              ) : (
                upcomingExamsData.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center gap-3 sm:gap-4 border-b border-border/40 last:border-0 pb-3.5 last:pb-0 group/exam hover:bg-muted/20 p-2 -mx-2 rounded-lg transition-colors"
                  >
                    <div className="p-2 sm:p-2.5 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20 group-hover/exam:bg-orange-500/20 group-hover/exam:scale-110 transition-all duration-300 shrink-0">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground truncate group-hover/exam:text-orange-500 transition-colors">{exam.title}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500/50" />
                        {exam.start_time
                          ? format(new Date(exam.start_time), "dd MMM, h:mm a")
                          : "TBA"}
                        <span className="text-border mx-0.5">•</span>
                        <span className="truncate">{exam.batch?.name || exam.course?.title || "Global"}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
