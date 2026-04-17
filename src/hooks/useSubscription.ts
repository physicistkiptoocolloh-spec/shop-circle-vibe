import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSubscription(userId?: string) {
  return useQuery({
    queryKey: ["subscription", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("seller_subscriptions")
        .select("*")
        .eq("user_id", userId!)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: false });
      const boost = data?.find(s => s.type === "boost") || null;
      const verification = data?.find(s => s.type === "verification") || null;
      return {
        boost,
        verification,
        isBoosted: !!boost,
        isVerified: !!verification,
        dailyLimit: boost ? 999 : verification ? 10 : 3,
      };
    },
  });
}
