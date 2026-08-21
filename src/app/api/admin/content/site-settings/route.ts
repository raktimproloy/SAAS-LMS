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

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { group_name: "site_config" }
    });
    
    // Convert array of objects to key-value map
    const configMap = settings.reduce((acc, curr) => {
      acc[curr.setting_key] = curr.setting_value;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json(configMap);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const hasPerm = await checkPermission("content");
  if (!hasPerm) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json();
    
    // Update or create each setting
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        await prisma.siteSetting.upsert({
          where: { setting_key: key },
          update: { setting_value: value },
          create: {
            setting_key: key,
            setting_value: value,
            setting_type: "text",
            group_name: "site_config"
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
