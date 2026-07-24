import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { student_id, password } = await request.json();

    if (!student_id || !password) {
      return NextResponse.json({ error: "Student ID and password are required" }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { student_id: student_id },
          { phone: student_id }
        ]
      },
      include: { batch: true },
    });

    if (!student || student.status !== "active") {
      return NextResponse.json({ error: "Invalid credentials or inactive account" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate token
    const token = signToken({
      id: student.id,
      role: "student",
      student_id: student.student_id,
    });

    const maxAge = 7 * 24 * 60 * 60; // 7 days

    const response = NextResponse.json({
      success: true,
      user: {
        id: student.id,
        student_id: student.student_id,
        name: student.name,
        batch_name: student.batch.name,
      },
    });

    response.cookies.set({
      name: "student_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAge,
      expires: new Date(Date.now() + maxAge * 1000),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Student login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
