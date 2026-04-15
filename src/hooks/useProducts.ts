import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type DbProduct = Database["public"]["Tables"]["products"]["Row"];
export type DbProductInsert = Database["public"]["Tables"]["products"]["Insert"];

export function useProducts(filters?: { category?: string; search?: string; sellerId?: string }) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("*")
        .eq("is_archived", false)
        .order("is_boosted", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters?.category) q = q.eq("category", filters.category);
      if (filters?.sellerId) q = q.eq("seller_id", filters.sellerId);
      if (filters?.search) q = q.ilike("title", `%${filters.search}%`);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useMyProducts(userId?: string) {
  return useQuery({
    queryKey: ["my-products", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: DbProductInsert) => {
      const { data, error } = await supabase.from("products").insert(product).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbProduct> & { id: string }) => {
      const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["my-products"] });
    },
  });
}

export function useIncrementViews() {
  return useMutation({
    mutationFn: async (id: string) => {
      // Simple increment - in production use a db function
      const { data: product } = await supabase.from("products").select("views").eq("id", id).single();
      if (product) {
        await supabase.from("products").update({ views: (product.views || 0) + 1 }).eq("id", id);
      }
    },
  });
}
