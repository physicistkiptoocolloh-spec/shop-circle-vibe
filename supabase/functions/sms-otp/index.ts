// SMS OTP edge function - sends and verifies phone OTPs via sms-gate.app
// Actions: send, verify
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SMS_GATE_URL = "https://api.sms-gate.app/3rdparty/v1/message";

function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizePhone(p: string): string {
  return p.replace(/[\s\-()]/g, "");
}

async function sendSms(phone: string, message: string) {
  const username = Deno.env.get("SMS_GATE_USERNAME")!;
  const password = Deno.env.get("SMS_GATE_PASSWORD")!;
  const auth = btoa(`${username}:${password}`);
  const res = await fetch(SMS_GATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      message,
      phoneNumbers: [phone],
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`SMS Gateway: ${res.status} ${txt}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const body = await req.json().catch(() => ({}));

    // ── Send OTP ──
    if (action === "send") {
      const phone = normalizePhone(String(body.phone || ""));
      if (!phone || phone.length < 9) {
        return new Response(JSON.stringify({ error: "Invalid phone number" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Rate-limit: 1 OTP per minute per phone
      const { data: recent } = await supabase
        .from("phone_otps")
        .select("last_sent_at")
        .eq("phone", phone)
        .order("last_sent_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recent) {
        const elapsed = (Date.now() - new Date(recent.last_sent_at).getTime()) / 1000;
        if (elapsed < 60) {
          return new Response(JSON.stringify({
            error: "Please wait before requesting a new code",
            retryIn: Math.ceil(60 - elapsed),
          }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      const code = genCode();
      // Invalidate old codes for this phone
      await supabase.from("phone_otps").delete().eq("phone", phone);
      await supabase.from("phone_otps").insert({ phone, code });

      try {
        await sendSms(phone, `Your SokoMtaani verification code is: ${code}. Expires in 5 minutes. Do not share it.`);
      } catch (e) {
        console.error("SMS send failed", e);
        return new Response(JSON.stringify({ error: "Failed to send SMS. Try again." }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, retryIn: 60 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Verify OTP ──
    if (action === "verify") {
      const phone = normalizePhone(String(body.phone || ""));
      const code = String(body.code || "").trim();
      if (!phone || !code) {
        return new Response(JSON.stringify({ error: "Phone and code required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: otp } = await supabase
        .from("phone_otps")
        .select("*")
        .eq("phone", phone)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!otp) {
        return new Response(JSON.stringify({ error: "No code found. Request a new one." }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (new Date(otp.expires_at).getTime() < Date.now()) {
        return new Response(JSON.stringify({ error: "Code expired. Request a new one." }), {
          status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (otp.attempts >= 5) {
        return new Response(JSON.stringify({ error: "Too many attempts. Request a new code." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (otp.code !== code) {
        await supabase.from("phone_otps").update({ attempts: otp.attempts + 1 }).eq("id", otp.id);
        return new Response(JSON.stringify({ error: "Invalid code", invalid: true }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("phone_otps").update({ verified: true }).eq("id", otp.id);

      return new Response(JSON.stringify({ success: true, phone }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("sms-otp error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
