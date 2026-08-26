import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, CreditCard, Activity, FileText, Calendar as CalendarIcon, BookOpen } from "lucide-react";
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
      status: "paid"
    },
    _sum: {
      amount: true
    }
  });

  const totalRevenue = thisMonthPayments._sum.amount || 0;

  const recentStudentsData = await prisma.student.findMany({
    take: 5,
    orderBy: { created_at: "desc" },
    include: {
      batch: true,
      payments: {
        orderBy: { created_at: "desc" },
        take: 1
      }
    }
  });

  const upcomingExamsData = await prisma.exam.findMany({
    where: { start_time: { gt: new Date() }, status: "active" },
    take: 5,
    orderBy: { start_time: "asc" },
    include: { batch: true, course: true }
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaysClasses = await prisma.curriculumSession.findMany({
    where: {
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
      is_cancelled: false,
      session_type: { in: ["class", "exam"] },
      curriculum: {
        status: "active",
      },
    },
    include: {
      curriculum: {
        include: {
          batch: true,
          course: true
        }
      },
      topics: true
    },
    orderBy: { curriculum_id: "asc" },
    take: 5
  });

  const stats = [
    { title: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Batches", value: activeBatches.toLocaleString(), icon: GraduationCap, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Revenue (This Month)", value: `৳ ${totalRevenue.toLocaleString()}`, icon: CreditCard, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Active Exams", value: activeExams.toLocaleString(), icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="flex flex-col gap-6" data-aos="fade-up">
      <div data-aos="fade-down">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your institute&apos;s performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm dark:bg-slate-800/50" data-aos="fade-up" data-aos-delay={i * 100}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm dark:bg-slate-800/50" data-aos="fade-right" data-aos-delay="400">
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentStudentsData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                        No recent enrollments
                      </TableCell>
                    </TableRow>
                  ) : recentStudentsData.map((student) => {
                    const status = student.payments.length > 0 ? student.payments[0].status : "Pending";
                    return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.batch?.name}</TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(student.created_at), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={status.toLowerCase() === "paid" ? "default" : "destructive"} className="capitalize">
                          {status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm dark:bg-slate-800/50" data-aos="fade-left" data-aos-delay="500">
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExamsData.length === 0 ? (
                <div className="text-center text-muted-foreground py-6 border rounded-lg border-dashed">
                  No upcoming exams scheduled
                </div>
              ) : upcomingExamsData.map((exam) => (
                <div key={exam.id} className="flex items-center gap-4 border-b last:border-0 pb-3 last:pb-0">
                  <div className="p-2 rounded-full bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {exam.start_time ? format(new Date(exam.start_time), "dd MMM, h:mm a") : "TBA"} • {exam.batch?.name || exam.course?.title || "Global"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-6">
        <Card className="border-none shadow-sm dark:bg-slate-800/50" data-aos="fade-up" data-aos-delay="600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Today's Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysClasses.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 border rounded-lg border-dashed">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                    <CalendarIcon className="h-6 w-6 text-primary" />
                  </div>
                  No classes scheduled for today
                </div>
              ) : todaysClasses.map((session) => (
                <div key={session.id} className="flex items-start gap-4 border-b last:border-0 pb-4 last:pb-0">
                  <div className="p-2 rounded-full bg-primary/10 mt-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-primary">{session.curriculum?.batch?.name}</p>
                      <Badge variant={session.is_completed ? "outline" : "default"} className="text-[10px]">
                        {session.is_completed ? "Completed" : "Upcoming"}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium mt-0.5">
                      Class {session.session_number}: {session.curriculum?.course?.title}
                    </p>
                    {session.is_holiday ? (
                      <Badge variant="outline" className="mt-2 text-orange-500 border-orange-200">
                        Holiday: {session.holiday_name}
                      </Badge>
                    ) : (
                      <div className="mt-2 space-y-1">
                        {session.topics.length > 0 ? session.topics.map((t, i) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                            {t.chapter_name} {t.topic_name ? `- ${t.topic_name}` : ''}
                          </p>
                        )) : (
                          <p className="text-xs text-muted-foreground italic">No topics assigned</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
