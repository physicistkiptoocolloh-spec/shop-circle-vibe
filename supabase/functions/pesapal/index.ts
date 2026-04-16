const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PESAPAL_BASE = "https://pay.pesapal.com/v3";

async function getAuthToken(): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: Deno.env.get("PESAPAL_CONSUMER_KEY"),
      consumer_secret: Deno.env.get("PESAPAL_CONSUMER_SECRET"),
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Auth failed");
  return data.token;
}

async function registerIPN(token: string, callbackUrl: string) {
  const res = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: callbackUrl,
      ipn_notification_type: "GET",
    }),
  });
  return res.json();
}

async function submitOrder(token: string, order: {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callbackUrl: string;
  ipnId: string;
  billing: { email: string; first_name: string; last_name: string; phone?: string };
}) {
  const res = await fetch(`${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      description: order.description,
      callback_url: order.callbackUrl,
      notification_id: order.ipnId,
      billing_address: {
        email_address: order.billing.email,
        first_name: order.billing.first_name,
        last_name: order.billing.last_name,
        phone_number: order.billing.phone || "",
      },
    }),
  });
  return res.json();
}

async function getTransactionStatus(token: string, orderTrackingId: string) {
  const res = await fetch(
    `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // IPN callback handler
    if (action === "ipn") {
      const orderTrackingId = url.searchParams.get("OrderTrackingId");
      const orderMerchantReference = url.searchParams.get("OrderMerchantReference");
      console.log("IPN received:", { orderTrackingId, orderMerchantReference });
      
      if (orderTrackingId) {
        const token = await getAuthToken();
        const status = await getTransactionStatus(token, orderTrackingId);
        console.log("Transaction status:", status);
        // TODO: Update order status in database based on status.payment_status_description
      }
      
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Submit order
    if (req.method === "POST" && action === "submit") {
      const body = await req.json();
      const { id, currency, amount, description, callbackUrl, billing } = body;

      if (!id || !amount || !billing?.email || !billing?.first_name) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const token = await getAuthToken();

      // Register IPN
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const ipnUrl = `${supabaseUrl}/functions/v1/pesapal?action=ipn`;
      const ipn = await registerIPN(token, ipnUrl);

      const result = await submitOrder(token, {
        id,
        currency: currency || "KES",
        amount,
        description: description || "SokoMtaani Payment",
        callbackUrl: callbackUrl || "",
        ipnId: ipn.ipn_id,
        billing,
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check status
    if (action === "status") {
      const orderTrackingId = url.searchParams.get("orderTrackingId");
      if (!orderTrackingId) {
        return new Response(JSON.stringify({ error: "Missing orderTrackingId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const token = await getAuthToken();
      const status = await getTransactionStatus(token, orderTrackingId);
      return new Response(JSON.stringify(status), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PesaPal error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
