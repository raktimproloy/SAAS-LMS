import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().set({
    name: "student_token",
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  
  return NextResponse.json({ success: true });
}
