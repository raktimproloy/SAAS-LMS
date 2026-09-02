import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || (payload.role !== "super_admin" && !payload.permissions?.includes("analytics"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const monthStr = searchParams.get("month");
    const yearStr = searchParams.get("year");

    const now = new Date();
    const targetMonth = monthStr ? parseInt(monthStr) : now.getMonth() + 1; // 1-12
    const targetYear = yearStr ? parseInt(yearStr) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Fetch Payments for the target month
    // Note: Payment model has `month` and `year` fields, and `paid_at` for actual payment date
    // We will match by paid_at if status="paid", and month/year for due amounts.
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          {
            status: { in: ["paid", "partial"] },
            paid_at: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            status: { in: ["due", "partial"] },
            month: targetMonth,
            year: targetYear
          }
        ]
      },
      include: {
        student: { select: { name: true, student_id: true } }
      }
    });

    // Fetch Expenses for the target month
    const expenses = await prisma.expense.findMany({
      where: {
        expense_date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { expense_date: 'desc' }
    });

    let totalRevenue = 0;
    let totalDue = 0;
    const revenueByType: Record<string, number> = {};
    const dailyData: Record<number, { revenue: number; expense: number }> = {};

    // Initialize daily data
    const daysInMonth = endDate.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      dailyData[i] = { revenue: 0, expense: 0 };
    }

    const recentRevenues: any[] = [];

    payments.forEach(p => {
      if (p.status === "paid" || p.status === "partial") {
        const paidAmount = p.amount - p.discount - p.due_amount;
        if (p.paid_at && p.paid_at >= startDate && p.paid_at <= endDate) {
          totalRevenue += paidAmount;
          
          const type = p.payment_type || "Other";
          revenueByType[type] = (revenueByType[type] || 0) + paidAmount;

          const day = p.paid_at.getDate();
          if (dailyData[day]) {
            dailyData[day].revenue += paidAmount;
          }

          recentRevenues.push({
            id: p.id,
            date: p.paid_at,
            student_name: p.student?.name || "Unknown",
            student_id: p.student?.student_id,
            payment_type: type,
            amount: paidAmount
          });
        }
      }

      if (p.status === "due" || p.status === "partial") {
        if (p.month === targetMonth && p.year === targetYear) {
          totalDue += p.due_amount;
        }
      }
    });

    let totalExpenses = 0;
    expenses.forEach(e => {
      totalExpenses += e.amount;
      const day = e.expense_date.getDate();
      if (dailyData[day]) {
        dailyData[day].expense += e.amount;
      }
    });

    const netProfit = totalRevenue - totalExpenses;

    const chartData = Object.keys(dailyData).map(day => ({
      day: parseInt(day),
      revenue: dailyData[parseInt(day)].revenue,
      expense: dailyData[parseInt(day)].expense
    }));

    const typeData = Object.keys(revenueByType).map(key => ({
      name: key,
      value: revenueByType[key]
    }));

    // Sort recent revenues descending
    recentRevenues.sort((a, b) => b.date.getTime() - a.date.getTime());

    return NextResponse.json({
      success: true,
      data: {
        kpi: {
          totalRevenue,
          totalExpenses,
          netProfit,
          totalDue
        },
        chartData,
        typeData,
        recentExpenses: expenses.slice(0, 50),
        recentRevenues: recentRevenues.slice(0, 50)
      }
    });

  } catch (error) {
    console.error("Finance analytics error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
