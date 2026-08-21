import crypto from "crypto";

const QB_API_URL = process.env.QUESTION_BANK_API_URL || "http://localhost:4001";
const QB_WEB_URL = process.env.QUESTION_BANK_WEB_URL || "http://localhost:3001";
const QB_CLIENT_ID = process.env.QB_CLIENT_ID || "teacher-local";
const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET || "dev_secret_change_in_production_32chars";

export function isQuestionBankConfigured(): boolean {
  return Boolean(QB_CLIENT_ID && QB_CLIENT_SECRET && QB_API_URL && QB_WEB_URL);
}

export function buildHmacHeaders(): Record<string, string> {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const signature = crypto
    .createHmac("sha256", QB_CLIENT_SECRET)
    .update(`${timestamp}.${nonce}`)
    .digest("hex");

  return {
    "Content-Type": "application/json",
    "X-Client-Id": QB_CLIENT_ID,
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": signature,
  };
}

export async function requestEmbedToken(userId: string, userName: string, role = "teacher") {
  const headers = buildHmacHeaders();
  const res = await fetch(`${QB_API_URL}/v1/sso/embed-token`, {
    method: "POST",
    headers,
    body: JSON.stringify({ user_id: userId, user_name: userName, role }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to get embed token");
  }
  return data as { embed_token: string; expires_in_seconds: number };
}

export async function fetchTenantStatus() {
  try {
    await requestEmbedToken("health", "Health Check");
    return { configured: true, status: "active" as const };
  } catch {
    return { configured: isQuestionBankConfigured(), status: "inactive" as const };
  }
}

export async function fetchPaperById(paperId: string): Promise<QbPaper> {
  const res = await fetch(`${QB_API_URL}/v1/papers/${encodeURIComponent(paperId)}`, {
    headers: {
      "X-Client-Id": QB_CLIENT_ID,
      Authorization: `Bearer ${QB_CLIENT_SECRET}`,
    },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Paper not found");
  }
  return data.paper as QbPaper;
}

export interface QbPaperQuestion {
  id: string;
  type: "mcq";
  question_text: string;
  options: { id: string; text: string }[];
  correct_option: string;
  marks: number;
  explanation?: string;
}

export interface QbPaper {
  id: string;
  tenant_id: string;
  title: string;
  board: string;
  subject: string;
  created_at: string;
  questions: QbPaperQuestion[];
}

export function getEmbedUrl(embedToken: string): string {
  return `${QB_WEB_URL}/embed?token=${encodeURIComponent(embedToken)}`;
}

export { QB_API_URL, QB_WEB_URL, QB_CLIENT_ID };
