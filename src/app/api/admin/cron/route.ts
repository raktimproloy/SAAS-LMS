import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';
async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

export async function GET(req: NextRequest) {
  try {
    const hasPerm = await checkPermission("sms");
    if (!hasPerm) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action_type = searchParams.get("action_type");

    let jobs;
    if (action_type) {
      jobs = await prisma.cronJob.findMany({ where: { action_type } });
    } else {
      jobs = await prisma.cronJob.findMany();
    }

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("Cron API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const hasPerm = await checkPermission("sms");
    if (!hasPerm) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, is_active, schedule, metadata } = body;

    if (!id) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const updated = await prisma.cronJob.update({
      where: { id },
      data: {
        is_active: is_active !== undefined ? is_active : undefined,
        schedule: schedule !== undefined ? schedule : undefined,
        metadata: metadata !== undefined ? metadata : undefined,
      }
    });

    return NextResponse.json({ success: true, job: updated });
  } catch (error: any) {
    console.error("Cron API PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
