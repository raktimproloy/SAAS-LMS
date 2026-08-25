import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

async function checkPermission(permission: string) {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return adminPayload.permissions?.includes("all") || adminPayload.permissions?.includes(permission);
}

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { setting_key: "financial_password" }
    });
    
    return NextResponse.json({ hasPassword: !!setting?.setting_value });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch setting" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("all"); // Require high permissions
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const { password } = await request.json();
    
    if (!password) {
      // If empty string is passed, we delete the password
      await prisma.siteSetting.delete({
        where: { setting_key: "financial_password" }
      }).catch(() => {}); // Ignore error if it doesn't exist
      return NextResponse.json({ success: true, message: "Password removed" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.siteSetting.upsert({
      where: { setting_key: "financial_password" },
      update: { setting_value: hashedPassword },
      create: {
        setting_key: "financial_password",
        setting_value: hashedPassword,
        setting_type: "text",
        group_name: "site_config"
      }
    });

    return NextResponse.json({ success: true, message: "Password updated" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
