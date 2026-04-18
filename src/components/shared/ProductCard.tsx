import { Eye, MapPin, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfileById } from "@/hooks/useProfiles";
import { useSubscription } from "@/hooks/useSubscription";
import { UserAvatar } from "./UserAvatar";
import { VerificationBadge } from "./VerificationBadge";
import type { DbProduct } from "@/hooks/useProducts";

interface ProductCardProps {
  product: DbProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { data: seller } = useProfileById(product.seller_id);
  const { data: sellerSub } = useSubscription(product.seller_id);

  return (
    <button
      onClick={() => navigate(`/product/${product.id}`)}
      className="flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow text-left w-full animate-fade-in"
    >
      <div className="relative aspect-square overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No image</div>
        )}
        {product.is_boosted && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Rocket className="h-3 w-3" /> Boosted
          </span>
        )}
        {product.is_sold_out && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <span className="bg-card text-foreground font-bold px-3 py-1 rounded-full text-sm">SOLD OUT</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <p className="font-bold text-primary text-sm">
          {product.currency} {Number(product.price).toLocaleString()}
        </p>
        <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">{product.title}</p>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="text-[11px] truncate">{product.location || "Unknown"}</span>
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <UserAvatar
              icon={seller?.avatar_icon || "User"}
              avatar={seller?.avatar_url}
              size="sm"
              className="!h-5 !w-5"
            />
            <span className="text-[11px] text-muted-foreground truncate">{seller?.name || "Seller"}</span>
            {sellerSub?.isVerified && <VerificationBadge tier={1} size={12} />}
          </div>
          <div className="flex items-center gap-0.5 text-muted-foreground flex-shrink-0">
            <Eye className="h-3 w-3" />
            <span className="text-[10px]">{product.views}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
