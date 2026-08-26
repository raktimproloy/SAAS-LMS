import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function checkCurriculumPermission() {
  const token = cookies().get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  const adminPayload = payload as { role: string; permissions?: string[] };
  if (adminPayload.role === "super_admin") return true;
  return (
    adminPayload.permissions?.includes("all") ||
    adminPayload.permissions?.includes("curriculum")
  );
}
