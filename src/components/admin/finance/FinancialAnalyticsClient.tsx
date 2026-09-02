"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign, Wallet, CreditCard, Loader2, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { format, subMonths, addMonths } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function FinancialAnalyticsClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchAnalytics = async (date: Date) => {
    setLoading(true);
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const res = await fetch(`/api/admin/analytics/finance?month=${month}&year=${year}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(currentDate);
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpi = data?.kpi || { totalRevenue: 0, totalExpenses: 0, netProfit: 0, totalDue: 0 };
  const chartData = data?.chartData || [];
  const typeData = data?.typeData || [];
  const recentRevenues = data?.recentRevenues || [];
  const recentExpenses = data?.recentExpenses || [];

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-4 rounded-xl border shadow-sm print:border-none print:shadow-none print:bg-transparent print:p-0 print:mb-6">
        <Button variant="outline" onClick={handlePrevMonth} className="rounded-full w-10 h-10 p-0 print:hidden">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold tracking-tight text-center flex-1 print:text-left print:text-2xl">
          <span className="hidden print:inline">Financial Report - </span>{format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" onClick={handleNextMonth} className="rounded-full w-10 h-10 p-0">
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button variant="default" onClick={() => window.print()} className="gap-2 ml-2 shadow-md">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-950 border-blue-100 dark:border-blue-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Revenue</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-950 dark:text-blue-100">৳ {kpi.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-slate-950 border-rose-100 dark:border-rose-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-800 dark:text-rose-300">Total Expenses</CardTitle>
            <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-full">
              <Wallet className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-950 dark:text-rose-100">৳ {kpi.totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-gradient-to-br to-white dark:to-slate-950",
          kpi.netProfit >= 0 
            ? "from-emerald-50 dark:from-emerald-950/20 border-emerald-100 dark:border-emerald-900/50" 
            : "from-red-50 dark:from-red-950/20 border-red-100 dark:border-red-900/50"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={cn(
              "text-sm font-medium",
              kpi.netProfit >= 0 ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"
            )}>Net Profit</CardTitle>
            <div className={cn(
              "p-2 rounded-full",
              kpi.netProfit >= 0 ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-red-100 dark:bg-red-900/50"
            )}>
              {kpi.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              kpi.netProfit >= 0 ? "text-emerald-950 dark:text-emerald-100" : "text-red-950 dark:text-red-100"
            )}>
              ৳ {kpi.netProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-950 border-amber-100 dark:border-amber-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-300">Total Pending/Due</CardTitle>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
              <CreditCard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-950 dark:text-amber-100">৳ {kpi.totalDue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-md border-0">
          <CardHeader>
            <CardTitle>Daily Revenue & Expenses</CardTitle>
            <CardDescription>Overview of daily financial activity in {format(currentDate, "MMMM yyyy")}</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            {chartData.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `৳${value}`} />
                    <RechartsTooltip 
                      formatter={(value: any) => [`৳${value}`, undefined]}
                      labelFormatter={(label) => `${label} ${format(currentDate, "MMM")}`}
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                No data available for this month.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-md border-0">
          <CardHeader>
            <CardTitle>Revenue by Payment Type</CardTitle>
            <CardDescription>Distribution of income sources</CardDescription>
          </CardHeader>
          <CardContent>
            {typeData.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {typeData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => [`৳${value}`, undefined]} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                No revenue data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                        No expenses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentExpenses.map((expense: any) => (
                      <TableRow key={expense.id}>
                        <TableCell className="whitespace-nowrap">{format(new Date(expense.expense_date), "dd MMM")}</TableCell>
                        <TableCell className="font-medium">{expense.title}</TableCell>
                        <TableCell className="text-right text-rose-600 font-semibold">৳{expense.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Recent Payments (Revenue)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRevenues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No payments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentRevenues.map((rev: any) => (
                      <TableRow key={rev.id}>
                        <TableCell className="whitespace-nowrap">{format(new Date(rev.date), "dd MMM")}</TableCell>
                        <TableCell className="font-medium">
                          {rev.student_name}
                          <div className="text-xs text-muted-foreground">{rev.student_id}</div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {rev.payment_type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 font-semibold">৳{rev.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
