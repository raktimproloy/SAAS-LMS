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
    </div>
  );
}
