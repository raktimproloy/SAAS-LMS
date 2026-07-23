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

export default function AdminDashboard() {
  // Mock data for initial UI setup
  const stats = [
    { title: "Total Students", value: "2,543", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Batches", value: "12", icon: GraduationCap, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Total Revenue (This Month)", value: "৳ 450,000", icon: CreditCard, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Active Exams", value: "3", icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  const recentStudents = [
    { id: "#0012", name: "Rahim Islam", batch: "SSC 2026 - Morning", date: "Today", status: "Paid" },
    { id: "#0013", name: "Karim Khan", batch: "HSC 2026 - Evening", date: "Today", status: "Pending" },
    { id: "#0014", name: "Nusrat Jahan", batch: "Medical Admission", date: "Yesterday", status: "Paid" },
    { id: "#0015", name: "Sadiya Akter", batch: "SSC 2026 - Morning", date: "Yesterday", status: "Paid" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your institute&apos;s performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm dark:bg-slate-800/50">
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
        <Card className="col-span-4 border-none shadow-sm dark:bg-slate-800/50">
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
                  {recentStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.batch}</TableCell>
                      <TableCell className="text-muted-foreground">{student.date}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={student.status === "Paid" ? "default" : "destructive"}>
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Botany Chapter 1-3", date: "Tommorrow, 10:00 AM", batch: "HSC 2026" },
                { title: "Zoology Final Model Test", date: "25 Jul, 3:00 PM", batch: "Medical Admission" },
                { title: "Physics 1st Paper", date: "28 Jul, 10:00 AM", batch: "HSC 2026" },
              ].map((exam, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">{exam.date} • {exam.batch}</p>
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
