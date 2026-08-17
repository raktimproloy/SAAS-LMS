/** Exam.type in DB: "online_mcq" | "offline" */

export function isOfflineExamType(type?: string | null): boolean {
  return (type || "").toLowerCase().trim() === "offline";
}

export function isOnlineExamType(type?: string | null): boolean {
  const t = (type || "").toLowerCase().trim();
  if (!t || t === "offline") return false;
  return t === "online_mcq" || t === "online" || t.startsWith("online_");
}

export function examTypeLabel(type?: string | null): "Offline" | "Online" {
  return isOfflineExamType(type) ? "Offline" : "Online";
}
