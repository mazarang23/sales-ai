/**
 * ارسال پیامک OTP از طریق SMS.ir.
 * برای پروداکشن، کلید API و شناسه قالب را در .env بگذار.
 * در حالت dev (بدون کلید)، فقط در ترمینال لاگ می‌کند.
 */
export async function sendSms(phone: string, message: string): Promise<boolean> {
    const apiKey = process.env.SMSIR_API_KEY;
    const templateId = process.env.SMSIR_TEMPLATE_ID;
  
    // اگر کلید تنظیم نشده، در حالت dev فقط لاگ کن
    if (!apiKey || !templateId) {
      console.log("SMS (dev mode):", phone, "→", message);
      return true;
    }
  
    try {
      // کد OTP را از متن پیام استخراج کن
      const codeMatch = message.match(/\d{6}/);
      const code = codeMatch ? codeMatch[0] : message;
  
      const r = await fetch("https://api.sms.ir/v1/send/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/plain",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          mobile: phone,
          templateId: Number(templateId),
          parameters: [{ name: "CODE", value: code }]
        })
      });
  
      if (!r.ok) {
        const err = await r.text();
        console.error("SMS.ir error:", err);
        return false;
      }
      return true;
    } catch (e) {
      console.error("SMS.ir error:", e);
      return false;
    }
  }
  
  export function generateOtp(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }