import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Subscribes to incoming messages in realtime and returns the unread count
 * for the current user across all conversations.
 *
 * Exposes `refresh()` so screens can immediately recompute the badge after
 * marking messages as read.
 */
let listeners = new Set<() => void>();

export function notifyUnreadChanged() {
  listeners.forEach((l) => l());
}

export function useUnreadMessageCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) { setCount(0); return; }
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
  }, [user?.id]);

  useEffect(() => {
    refresh();
    listeners.add(refresh);
    if (!user) return () => { listeners.delete(refresh); };

    const channel = supabase
      .channel("inbox-unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => refresh())
      .subscribe();
    return () => {
      listeners.delete(refresh);
      supabase.removeChannel(channel);
    };
  }, [user?.id, refresh]);

  return count;
}
