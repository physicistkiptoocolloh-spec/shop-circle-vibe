import { supabase } from "@/integrations/supabase/client";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const FN_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/pesapal`;

export interface CheckoutOptions {
  type: "boost" | "verification";
  tierId: number;
  amount: number;
  currency?: string;
  description: string;
  durationDays: number;
  user: { id: string; email?: string | null; phone?: string | null; name?: string | null };
}

/**
 * Submits a PesaPal order, opens the redirect URL, and pre-creates a pending subscription record.
 * Activation happens on IPN callback in production.
 */
export async function startCheckout(opts: CheckoutOptions) {
  const orderId = `${opts.type}-${opts.user.id.slice(0, 8)}-${Date.now()}`;
  const billingEmail = opts.user.email || `${opts.user.id}@sokomtaani.app`;
  const [first, ...rest] = (opts.user.name || "Seller").split(" ");
  const last = rest.join(" ") || "User";

  const callbackUrl = `${window.location.origin}/dashboard?payment=success&type=${opts.type}&tier=${opts.tierId}`;

  const res = await fetch(`${FN_URL}?action=submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON}`,
      apikey: ANON,
    },
    body: JSON.stringify({
      id: orderId,
      currency: opts.currency || "KES",
      amount: opts.amount,
      description: opts.description,
      callbackUrl,
      billing: {
        email: billingEmail,
        first_name: first,
        last_name: last,
        phone: opts.user.phone || "",
      },
    }),
  });

  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || data.error || "Payment failed");

  // Pre-create subscription (will be auto-activated on success callback)
  const expires = new Date();
  expires.setDate(expires.getDate() + opts.durationDays);
  await supabase.from("seller_subscriptions").insert({
    user_id: opts.user.id,
    type: opts.type,
    tier: opts.tierId,
    expires_at: expires.toISOString(),
    is_active: true, // optimistic; downgrade if IPN reports failure
  });

  if (data.redirect_url) {
    window.location.href = data.redirect_url;
  } else {
    throw new Error("No payment URL returned");
  }
}
