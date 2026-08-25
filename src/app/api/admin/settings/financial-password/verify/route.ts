import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { setting_key: "financial_password" }
    });

    if (!setting || !setting.setting_value) {
      // If there's no password set, it shouldn't require one, but return true just in case
      return NextResponse.json({ success: true });
    }

    const isValid = await bcrypt.compare(password, setting.setting_value);
    
    if (isValid) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
