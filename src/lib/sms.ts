import "dotenv/config";
export async function sendSMS(phone: string, message: string) {
  const apiKey = process.env.BULKSMS_API_KEY;
  const senderId = process.env.BULKSMS_SENDER_ID;

  if (!apiKey || !senderId) {
    console.error("BulkSMS credentials missing in environment variables.");
    return null;
  }

  try {
    const url = new URL("http://bulksmsbd.net/api/smsapi");
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
