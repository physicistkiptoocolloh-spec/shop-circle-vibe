import { Eye, MapPin, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Product, MOCK_SELLERS } from "@/lib/mockData";
import { VerificationBadge } from "./VerificationBadge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const seller = MOCK_SELLERS.find(s => s.id === product.sellerId);

  return (
    <button
      onClick={() => navigate(`/product/${product.id}`)}
      className="flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow text-left w-full animate-fade-in"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {product.isBoosted && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Rocket className="h-3 w-3" /> Boosted
          </span>
        )}
        {product.isSoldOut && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <span className="bg-card text-foreground font-bold px-3 py-1 rounded-full text-sm">SOLD OUT</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <p className="font-bold text-primary text-sm">
          {product.currency} {product.price.toLocaleString()}
        </p>
        <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">{product.title}</p>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="text-[11px] truncate">{product.location}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground">{seller?.name}</span>
            {seller && <VerificationBadge tier={seller.verificationTier} size={12} />}
          </div>
          <div className="flex items-center gap-0.5 text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span className="text-[10px]">{product.views}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
