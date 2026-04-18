import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Subscribes to incoming messages in realtime and returns the unread count
 * for the current user across all conversations.
 */
export function useUnreadMessageCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = async () => {
    if (!user) { setCount(0); return; }
    // Fetch conversations the user is in, then count unread messages not sent by them
    const { data: convos } = await supabase
      .from("conversations").select("id")
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`);
    const ids = (convos || []).map(c => c.id);
    if (!ids.length) { setCount(0); return; }
    const { count: unread } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", ids)
      .neq("sender_id", user.id)
      .eq("read", false);
    setCount(unread || 0);
  };

  useEffect(() => {
    refresh();
    if (!user) return;
    const channel = supabase
      .channel("inbox-unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return count;
}
