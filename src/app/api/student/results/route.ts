import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("student_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const payload = verifyToken(token);
  if (!payload || !payload.id || payload.role !== 'student') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const studentId = payload.id as number;

    const results = await prisma.examResult.findMany({
      where: { student_id: studentId },
      orderBy: { created_at: 'desc' },
      include: {
        exam: {
          include: {
            course: true,
            batch: true
          }
        }
      }
    });

    // Compute rank dynamically if it's null in the database
    const resultsWithRanks = await Promise.all(results.map(async (r) => {
      if (r.rank == null) {
        const higherScoring = await prisma.examResult.count({
          where: {
            exam_id: r.exam_id,
            OR: [
              { obtained_marks: { gt: r.obtained_marks } },
              { 
                obtained_marks: r.obtained_marks, 
                time_taken_seconds: { lt: r.time_taken_seconds ?? 999999 } 
              }
            ]
          }
        });
        return { ...r, rank: higherScoring + 1 };
      }
      return r;
    }));

    return NextResponse.json(resultsWithRanks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
