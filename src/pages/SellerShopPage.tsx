import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShoppingBag, Calendar, MapPin, MessageSquare, Phone } from "lucide-react";
import { MOCK_SELLERS, MOCK_PRODUCTS, MOCK_REVIEWS } from "@/lib/mockData";
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

  const seller = MOCK_SELLERS.find(s => s.id === id);
  if (!seller) return <div className="p-8 text-center">Seller not found</div>;

  const products = MOCK_PRODUCTS.filter(p => p.sellerId === seller.id && !p.isArchived);
  const reviews = MOCK_REVIEWS.filter(r => products.some(p => p.id === r.productId));

  const tabs = [
    { key: "products" as const, label: `Products (${products.length})` },
    { key: "reviews" as const, label: `Reviews (${reviews.length})` },
    { key: "about" as const, label: "About" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <span className="font-bold text-lg">Shop</span>
      </div>

      {/* Seller header */}
      <div className="px-4 pb-4 flex items-center gap-4">
        <UserAvatar icon={seller.avatarIcon} avatar={seller.avatar} size="xl" onClick={() => navigate(`/profile/${seller.id}`)} />
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold">{seller.name}</h1>
            <VerificationBadge tier={seller.verificationTier} size={20} />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" /> {seller.rating}</span>
            <span className="flex items-center gap-0.5"><ShoppingBag className="h-3 w-3" /> {seller.totalSales}</span>
            <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {seller.joinedYear}</span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {seller.location}</p>
        </div>
      </div>

      {seller.reportCount >= 3 && <div className="px-4 pb-3"><DangerSellerBanner /></div>}

      <div className="flex gap-2 px-4 pb-2">
        <button onClick={() => navigate(`/inbox?to=${seller.id}`)} className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"><MessageSquare className="h-4 w-4" /> Message</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn("flex-1 py-3 text-sm font-medium transition-colors", tab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "products" && (
          <div className="grid grid-cols-2 gap-3">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
            {products.length === 0 && <p className="col-span-2 text-center text-sm text-muted-foreground py-8">No products yet</p>}
          </div>
        )}

        {tab === "reviews" && (
          <div>
            {reviews.map(review => (
              <div key={review.id} className="mb-4 pb-4 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <UserAvatar icon={review.userAvatarIcon} size="sm" />
                  <span className="text-sm font-semibold">{review.userName}</span>
                  <StarRating rating={review.rating} size={12} />
                </div>
                <p className="text-sm mt-2">{review.text}</p>
                {review.replies.map(reply => (
                  <div key={reply.id} className="ml-8 mt-2 pl-3 border-l-2 border-primary/20">
                    <span className="text-xs font-semibold">{reply.userName}</span>
                    {reply.isSeller && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium ml-1">Seller</span>}
                    <p className="text-xs text-foreground/70 mt-0.5">{reply.text}</p>
                  </div>
                ))}
              </div>
            ))}
            {reviews.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No reviews yet</p>}
          </div>
        )}

        {tab === "about" && (
          <div className="space-y-4">
            <p className="text-sm">{seller.description}</p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {seller.location}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {seller.phone}</p>
              <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Member since {seller.joinedYear}</p>
              <p className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-muted-foreground" /> {seller.totalSales} total sales</p>
              <p className="flex items-center gap-2"><Star className="h-4 w-4 text-warning fill-warning" /> {seller.rating} ({seller.reviewCount} reviews)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
