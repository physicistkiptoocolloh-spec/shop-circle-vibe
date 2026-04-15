import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type DbReview = Database["public"]["Tables"]["reviews"]["Row"];
export type DbReviewReply = Database["public"]["Tables"]["review_replies"]["Row"];

export function useReviews(productId?: string) {
  return useQuery({
    queryKey: ["reviews", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useReviewsBySellerProducts(productIds: string[]) {
  return useQuery({
    queryKey: ["reviews-seller", productIds],
    enabled: productIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .in("product_id", productIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useReviewReplies(reviewIds: string[]) {
  return useQuery({
    queryKey: ["review-replies", reviewIds],
    enabled: reviewIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_replies")
        .select("*")
        .in("review_id", reviewIds)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: { product_id: string; user_id: string; rating: number; text: string }) => {
      const { data, error } = await supabase.from("reviews").insert(review).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["reviews", vars.product_id] });
    },
  });
}

export function useCreateReviewReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reply: { review_id: string; user_id: string; text: string; is_seller: boolean }) => {
      const { data, error } = await supabase.from("review_replies").insert(reply).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-replies"] });
    },
  });
}

export function useToggleReviewLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, userId }: { reviewId: string; userId: string }) => {
      const { data: existing } = await supabase
        .from("review_likes")
        .select("id")
        .eq("review_id", reviewId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        await supabase.from("review_likes").delete().eq("id", existing.id);
        await supabase.from("reviews").update({ likes: Math.max(0, 0) }).eq("id", reviewId); // will fix with rpc
      } else {
        await supabase.from("review_likes").insert({ review_id: reviewId, user_id: userId });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
