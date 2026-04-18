// Client helper for OTP edge function (SMS or WhatsApp)
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const FN_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/sms-otp`;

async function call(action: "send" | "verify", body: any) {
  const res = await fetch(`${FN_URL}?action=${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON}`,
      apikey: ANON,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

export type OtpChannel = "sms" | "whatsapp";

export const sendOtp = (phone: string, channel: OtpChannel = "sms") =>
  call("send", { phone, channel });

export const verifyOtp = (phone: string, code: string) =>
  call("verify", { phone, code });
