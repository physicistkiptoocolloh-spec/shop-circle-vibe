import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, MapPin, Truck, MessageSquare, ChevronLeft, ChevronRight, X, Star, Send, ThumbsUp, Eye, Calendar, ShoppingBag } from "lucide-react";
import { MOCK_PRODUCTS, MOCK_SELLERS, MOCK_REVIEWS } from "@/lib/mockData";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import { DangerSellerBanner } from "@/components/shared/DangerSellerBanner";
import { StarRating } from "@/components/shared/StarRating";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fullscreen, setFullscreen] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [liked, setLiked] = useState(false);

  const product = MOCK_PRODUCTS.find(p => p.id === id);
  const seller = product ? MOCK_SELLERS.find(s => s.id === product.sellerId) : null;
  const reviews = product ? MOCK_REVIEWS.filter(r => r.productId === product.id) : [];

  if (!product || !seller) {
    return <div className="p-8 text-center text-muted-foreground">Product not found</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Fullscreen image viewer */}
      {fullscreen && (
        <div className="fixed inset-0 z-[100] bg-foreground/95 flex flex-col">
          <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-card/20">
            <X className="h-6 w-6 text-primary-foreground" />
          </button>
          <div className="flex-1 flex items-center justify-center relative">
            <img src={product.images[currentImg]} alt="" className="max-h-full max-w-full object-contain" />
            {product.images.length > 1 && (
              <>
                <button onClick={() => setCurrentImg(i => Math.max(0, i - 1))} className="absolute left-2 p-2 rounded-full bg-card/20"><ChevronLeft className="h-6 w-6 text-primary-foreground" /></button>
                <button onClick={() => setCurrentImg(i => Math.min(product.images.length - 1, i + 1))} className="absolute right-2 p-2 rounded-full bg-card/20"><ChevronRight className="h-6 w-6 text-primary-foreground" /></button>
              </>
            )}
          </div>
          <div className="flex gap-2 p-4 justify-center overflow-x-auto">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setCurrentImg(i)} className={cn("w-14 h-14 rounded-lg overflow-hidden border-2", i === currentImg ? "border-primary" : "border-transparent opacity-60")}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image carousel */}
      <div className="relative">
        <button onClick={() => navigate(-1)} className="absolute top-3 left-3 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button onClick={() => setLiked(!liked)} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm">
          <Heart className={cn("h-5 w-5", liked ? "fill-destructive text-destructive" : "")} />
        </button>
        <button onClick={() => setFullscreen(true)} className="aspect-[4/3] w-full overflow-hidden">
          <img src={product.images[currentImg]} alt={product.title} className="w-full h-full object-cover" />
        </button>
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
          {product.images.map((img, i) => (
            <button key={i} onClick={() => setCurrentImg(i)} className={cn("w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0", i === currentImg ? "border-primary" : "border-border")}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Product info */}
      <div className="px-4 pb-4">
        <h1 className="text-xl font-bold">{product.title}</h1>
        <p className="text-2xl font-bold text-primary mt-1">{product.currency} {product.price.toLocaleString()}</p>

        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {product.location}</span>
          {product.shipping && <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Shipping available</span>}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{product.condition}</span>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{product.category}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto"><Eye className="h-3 w-3" />{product.views} views</span>
        </div>

        <p className="text-sm mt-4 text-foreground/80 leading-relaxed">{product.description}</p>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => navigate(`/inbox?to=${seller.id}`)}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <MessageSquare className="h-5 w-5" /> Message Seller
          </button>
          <button className="p-3 rounded-xl border border-border hover:bg-accent transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Seller card */}
        <button
          onClick={() => navigate(`/shop/${seller.id}`)}
          className="w-full mt-6 p-4 bg-muted rounded-xl flex items-center gap-3 text-left"
        >
          <UserAvatar icon={seller.avatarIcon} avatar={seller.avatar} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold truncate">{seller.name}</span>
              <VerificationBadge tier={seller.verificationTier} />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" /> {seller.rating}</span>
              <span className="flex items-center gap-0.5"><ShoppingBag className="h-3 w-3" /> {seller.totalSales} sales</span>
              <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> Since {seller.joinedYear}</span>
            </div>
          </div>
        </button>

        {seller.reportCount >= 3 && (
          <div className="mt-3">
            <DangerSellerBanner />
          </div>
        )}

        {/* Reviews */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3">Reviews ({reviews.length})</h2>
          {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet</p>}
          {reviews.map(review => (
            <div key={review.id} className="mb-4 pb-4 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <UserAvatar icon={review.userAvatarIcon} size="sm" />
                <span className="text-sm font-semibold">{review.userName}</span>
                <StarRating rating={review.rating} size={12} />
              </div>
              <p className="text-sm mt-2 text-foreground/80">{review.text}</p>
              <div className="flex items-center gap-3 mt-2">
                <button className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className={cn("h-3.5 w-3.5", review.likedByUser && "fill-primary text-primary")} />
                  {review.likes}
                </button>
                <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              {/* Replies */}
              {review.replies.map(reply => (
                <div key={reply.id} className="ml-8 mt-3 pl-3 border-l-2 border-primary/20">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold">{reply.userName}</span>
                    {reply.isSeller && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Seller</span>}
                  </div>
                  <p className="text-xs text-foreground/70 mt-1">{reply.text}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
