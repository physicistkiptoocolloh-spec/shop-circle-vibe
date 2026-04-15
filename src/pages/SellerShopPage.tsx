import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShoppingBag, Calendar, MapPin, MessageSquare, Phone, Loader2 } from "lucide-react";
import { useProfileById } from "@/hooks/useProfiles";
import { useProducts } from "@/hooks/useProducts";
import { useReviewsBySellerProducts } from "@/hooks/useReviews";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import { DangerSellerBanner } from "@/components/shared/DangerSellerBanner";
import { ProductCard } from "@/components/shared/ProductCard";
import { StarRating } from "@/components/shared/StarRating";
import { cn } from "@/lib/utils";

export default function SellerShopPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"products" | "reviews" | "about">("products");

  const { data: seller, isLoading } = useProfileById(id);
  const { data: products } = useProducts({ sellerId: id });
  const productIds = products?.map(p => p.id) || [];
  const { data: reviews } = useReviewsBySellerProducts(productIds);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!seller) return <div className="p-8 text-center">Seller not found</div>;

  const tabs = [
    { key: "products" as const, label: `Products (${products?.length || 0})` },
    { key: "reviews" as const, label: `Reviews (${reviews?.length || 0})` },
    { key: "about" as const, label: "About" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <span className="font-bold text-lg">Shop</span>
      </div>

      <div className="px-4 pb-4 flex items-center gap-4">
        <UserAvatar icon={seller.avatar_icon} avatar={seller.avatar_url} size="xl" onClick={() => navigate(`/profile/${seller.user_id}`)} />
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold">{seller.name || "Seller"}</h1>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {seller.location || "Unknown"}</p>
        </div>
      </div>

      {(seller.report_count || 0) >= 3 && <div className="px-4 pb-3"><DangerSellerBanner /></div>}

      <div className="flex gap-2 px-4 pb-2">
        <button onClick={() => navigate(`/inbox?to=${seller.user_id}`)} className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"><MessageSquare className="h-4 w-4" /> Message</button>
      </div>

      <div className="flex border-b border-border">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn("flex-1 py-3 text-sm font-medium transition-colors", tab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground")}>{t.label}</button>
        ))}
      </div>

      <div className="p-4">
        {tab === "products" && (
          <div className="grid grid-cols-2 gap-3">
            {products?.map(p => <ProductCard key={p.id} product={p} />)}
            {products?.length === 0 && <p className="col-span-2 text-center text-sm text-muted-foreground py-8">No products yet</p>}
          </div>
        )}

        {tab === "reviews" && (
          <div>
            {reviews?.map(review => (
              <div key={review.id} className="mb-4 pb-4 border-b border-border last:border-0">
                <StarRating rating={review.rating} size={12} />
                <p className="text-sm mt-2">{review.text}</p>
                <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {reviews?.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No reviews yet</p>}
          </div>
        )}

        {tab === "about" && (
          <div className="space-y-4">
            <p className="text-sm">{seller.description || "No description provided."}</p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {seller.location || "Unknown"}</p>
              {seller.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {seller.phone}</p>}
              <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Member since {new Date(seller.created_at).getFullYear()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
