import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { getSMSBalance } from "@/lib/sms";

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
    const hasPerm = await checkPermission("sms");
    if (!hasPerm) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getSMSBalance();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          responseCode: result.responseCode ?? null,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      balance: result.balance,
      formattedBalance: `৳${result.balance.toFixed(2)}`,
      responseCode: result.responseCode,
    });
  } catch (error) {
    console.error("SMS Balance API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
