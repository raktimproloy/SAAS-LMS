import "dotenv/config";

const BULK_SMS_BASE_URL = "http://bulksmsbd.net/api";

type BulkSmsSendResponse = Record<string, unknown> | { response: string } | null;

type BulkSmsBalanceSuccess = {
  response_code: number;
  balance: number;
};

type BulkSmsBalanceError = {
  response_code: number;
  error_message?: string;
};

export type SMSBalanceResult =
  | { success: true; balance: number; responseCode: number }
  | { success: false; error: string; responseCode?: number };

export async function getSMSBalance(): Promise<SMSBalanceResult> {
  const apiKey = process.env.BULKSMS_API_KEY;

  if (!apiKey) {
    return { success: false, error: "BulkSMS API key is not configured." };
  }

  try {
    const url = `${BULK_SMS_BASE_URL}/getBalanceApi?api_key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, { cache: "no-store" });

    let data: BulkSmsBalanceSuccess | BulkSmsBalanceError;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      return { success: false, error: text || "Invalid balance response from BulkSMSBD." };
    }

    if (data.response_code === 202 && typeof (data as BulkSmsBalanceSuccess).balance === "number") {
      return {
        success: true,
        balance: (data as BulkSmsBalanceSuccess).balance,
        responseCode: data.response_code,
      };
    }

    return {
      success: false,
      error: (data as BulkSmsBalanceError).error_message || "Failed to fetch SMS balance.",
      responseCode: data.response_code,
    };
  } catch (error) {
    console.error("Error fetching SMS balance:", error);
    return { success: false, error: "Could not connect to BulkSMSBD balance API." };
  }
}

export async function sendSMS(phone: string, message: string): Promise<BulkSmsSendResponse> {
  const apiKey = process.env.BULKSMS_API_KEY;
  const senderId = process.env.BULKSMS_SENDER_ID;

  if (!apiKey || !senderId) {
    console.error("BulkSMS credentials missing in environment variables.");
    return null;
  }

  try {
    const url = new URL(`${BULK_SMS_BASE_URL}/smsapi`);
    url.searchParams.append("api_key", apiKey);
    url.searchParams.append("type", "text"); // "text" for standard, BulkSMS BD handles unicode generally if properly encoded
    url.searchParams.append("number", phone);
    url.searchParams.append("senderid", senderId);
    url.searchParams.append("message", message);

    const response = await fetch(url.toString(), {
      // It's a GET request by default for BulkSMS BD
    });
    
    try {
      const data = await response.json();
      return data;
    } catch {
      const text = await response.text();
      return { response: text };
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    return null;
  }
}
