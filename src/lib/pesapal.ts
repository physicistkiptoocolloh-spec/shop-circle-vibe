import { supabase } from "@/integrations/supabase/client";

interface PesaPalOrder {
  id: string;
  amount: number;
  currency?: string;
  description?: string;
  callbackUrl: string;
  billing: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
}

export async function submitPesaPalOrder(order: PesaPalOrder) {
  const { data, error } = await supabase.functions.invoke("pesapal", {
    body: order,
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  // The function expects ?action=submit
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/pesapal?action=submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    }
  );
  
  if (!res.ok) throw new Error("Payment request failed");
  return res.json();
}

export async function checkPesaPalStatus(orderTrackingId: string) {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/pesapal?action=status&orderTrackingId=${orderTrackingId}`
  );
  if (!res.ok) throw new Error("Status check failed");
  return res.json();
}
