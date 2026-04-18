import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type DbConversation = Database["public"]["Tables"]["conversations"]["Row"];
export type DbMessage = Database["public"]["Tables"]["messages"]["Row"];

export function useConversations(userId?: string) {
  return useQuery({
    queryKey: ["conversations", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
        .order("last_message_time", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useMessages(conversationId?: string) {
  const qc = useQueryClient();
  // Realtime subscription so new messages appear instantly
  if (conversationId && typeof window !== "undefined") {
    const channelName = `messages-${conversationId}`;
    const existing = (supabase as any).getChannels?.().find((c: any) => c.topic === `realtime:${channelName}`);
    if (!existing) {
      supabase.channel(channelName)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
          () => qc.invalidateQueries({ queryKey: ["messages", conversationId] }))
        .subscribe();
    }
  }
  return useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, senderId, text }: { conversationId: string; senderId: string; text: string }) => {
      const { data, error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: senderId, text })
        .select()
        .single();
      if (error) throw error;

      // Update conversation last message
      await supabase.from("conversations").update({
        last_message: text,
        last_message_time: new Date().toISOString(),
      }).eq("id", conversationId);

      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useGetOrCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, otherUserId }: { userId: string; otherUserId: string }) => {
      // Check existing
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .or(`and(participant_one.eq.${userId},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${userId})`)
        .maybeSingle();

      if (existing) return existing;

      const { data, error } = await supabase
        .from("conversations")
        .insert({ participant_one: userId, participant_two: otherUserId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkMessagesRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId);
    },
    onSuccess: async (_, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      // Immediately recompute unread badge so the dot disappears on open
      const { notifyUnreadChanged } = await import("@/hooks/useUnreadMessages");
      notifyUnreadChanged();
    },
  });
}
