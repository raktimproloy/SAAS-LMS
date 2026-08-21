import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

export async function PUT(request: Request) {
  const hasPerm = await checkPermission("courses");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Update sort_order for each batch based on its index in the array
    await prisma.$transaction(
      orderedIds.map((id: number, index: number) =>
        prisma.batch.update({
          where: { id },
          data: { sort_order: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to reorder batches:", err);
    return NextResponse.json({ error: "Failed to reorder batches" }, { status: 500 });
  }
}
