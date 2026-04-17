import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, MapPin, Truck, MessageSquare, ChevronLeft, ChevronRight, X, Star, Send, ThumbsUp, Eye, Calendar, ShoppingBag, Loader2 } from "lucide-react";
import { useProduct, useIncrementViews } from "@/hooks/useProducts";
import { useProfileById } from "@/hooks/useProfiles";
import { useReviews, useReviewReplies, useCreateReview, useCreateReviewReply } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import { DangerSellerBanner } from "@/components/shared/DangerSellerBanner";
import { StarRating } from "@/components/shared/StarRating";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullscreen, setFullscreen] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);

  const { data: product, isLoading } = useProduct(id);
  const { data: seller } = useProfileById(product?.seller_id);
  const { data: reviews } = useReviews(id);
  const reviewIds = reviews?.map(r => r.id) || [];
  const { data: replies } = useReviewReplies(reviewIds);
  const createReview = useCreateReview();
  const incrementViews = useIncrementViews();

  useEffect(() => {
    if (id) incrementViews.mutate(id);
  }, [id]);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!product) return <div className="p-8 text-center text-muted-foreground">Product not found</div>;

  const images = product.images || [];

  const handleSubmitReview = () => {
    if (!user || !newReview.trim()) return;
    createReview.mutate({ product_id: product.id, user_id: user.id, rating: newRating, text: newReview.trim() });
    setNewReview("");
    setNewRating(5);
  };

  return (
    <div className="animate-fade-in">
      {/* Fullscreen viewer */}
      {fullscreen && images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-foreground/95 flex flex-col">
          <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-card/20"><X className="h-6 w-6 text-primary-foreground" /></button>
          <div className="flex-1 flex items-center justify-center relative">
            <img src={images[currentImg]} alt="" className="max-h-full max-w-full object-contain" />
            {images.length > 1 && (
              <>
                <button onClick={() => setCurrentImg(i => Math.max(0, i - 1))} className="absolute left-2 p-2 rounded-full bg-card/20"><ChevronLeft className="h-6 w-6 text-primary-foreground" /></button>
                <button onClick={() => setCurrentImg(i => Math.min(images.length - 1, i + 1))} className="absolute right-2 p-2 rounded-full bg-card/20"><ChevronRight className="h-6 w-6 text-primary-foreground" /></button>
              </>
            )}
          </div>
          <div className="flex gap-2 p-4 justify-center overflow-x-auto">
            {images.map((img, i) => (
              <button key={i} onClick={() => setCurrentImg(i)} className={cn("w-14 h-14 rounded-lg overflow-hidden border-2", i === currentImg ? "border-primary" : "border-transparent opacity-60")}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image carousel */}
      <div className="relative">
        <button onClick={() => navigate(-1)} className="absolute top-3 left-3 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm"><ArrowLeft className="h-5 w-5" /></button>
        <button onClick={() => setLiked(!liked)} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm">
          <Heart className={cn("h-5 w-5", liked ? "fill-destructive text-destructive" : "")} />
        </button>
        {images.length > 0 ? (
          <button onClick={() => setFullscreen(true)} className="aspect-[4/3] w-full overflow-hidden">
            <img src={images[currentImg]} alt={product.title} className="w-full h-full object-cover" />
          </button>
        ) : (
          <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center text-muted-foreground">No image</div>
        )}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <button key={i} onClick={() => setCurrentImg(i)} className={cn("w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0", i === currentImg ? "border-primary" : "border-border")}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="px-4 pb-4">
        <h1 className="text-xl font-bold">{product.title}</h1>
        <p className="text-2xl font-bold text-primary mt-1">{product.currency} {Number(product.price).toLocaleString()}</p>

        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {product.location || "Unknown"}</span>
          {product.shipping && <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Shipping</span>}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{product.condition}</span>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{product.category}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto"><Eye className="h-3 w-3" />{product.views} views</span>
        </div>

        <p className="text-sm mt-4 text-foreground/80 leading-relaxed">{product.description}</p>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button onClick={() => navigate(`/inbox?to=${product.seller_id}&product=${product.id}`)} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
            <MessageSquare className="h-5 w-5" /> Message Seller
          </button>
          <button className="p-3 rounded-xl border border-border hover:bg-accent transition-colors"><Share2 className="h-5 w-5" /></button>
        </div>

        {/* Seller card */}
        {seller && (
          <button onClick={() => navigate(`/shop/${seller.user_id}`)} className="w-full mt-6 p-4 bg-muted rounded-xl flex items-center gap-3 text-left">
            <UserAvatar icon={seller.avatar_icon} avatar={seller.avatar_url} size="lg" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold truncate">{seller.name || "Seller"}</span>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {seller.location || seller.country}</p>
            </div>
          </button>
        )}

        {seller && (seller.report_count || 0) >= 3 && <div className="mt-3"><DangerSellerBanner /></div>}

        {/* Write review */}
        {user && user.id !== product.seller_id && (
          <div className="mt-6 p-4 bg-muted rounded-xl">
            <h3 className="font-semibold text-sm mb-2">Write a Review</h3>
            <StarRating rating={newRating} interactive onChange={setNewRating} />
            <textarea value={newReview} onChange={e => setNewReview(e.target.value)} placeholder="Share your experience..." rows={2} className="w-full mt-2 bg-card rounded-lg px-3 py-2 text-sm outline-none resize-none" />
            <button onClick={handleSubmitReview} disabled={!newReview.trim()} className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-1"><Send className="h-3.5 w-3.5" /> Submit</button>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3">Reviews ({reviews?.length || 0})</h2>
          {reviews?.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>}
          {reviews?.map(review => {
            const reviewReplies = replies?.filter(r => r.review_id === review.id) || [];
            return (
              <div key={review.id} className="mb-4 pb-4 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size={12} />
                </div>
                <p className="text-sm mt-2 text-foreground/80">{review.text}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><ThumbsUp className="h-3.5 w-3.5" /> {review.likes}</span>
                  <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                {reviewReplies.map(reply => (
                  <div key={reply.id} className="ml-8 mt-3 pl-3 border-l-2 border-primary/20">
                    <div className="flex items-center gap-1">
                      {reply.is_seller && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Seller</span>}
                    </div>
                    <p className="text-xs text-foreground/70 mt-1">{reply.text}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
