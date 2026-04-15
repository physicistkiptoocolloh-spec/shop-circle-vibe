import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, ShoppingBag, Star, MessageSquare, Loader2 } from "lucide-react";
import { useProfileById } from "@/hooks/useProfiles";
import { useProducts } from "@/hooks/useProducts";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import { DangerSellerBanner } from "@/components/shared/DangerSellerBanner";
import { ProductCard } from "@/components/shared/ProductCard";

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useProfileById(id);
  const { data: products } = useProducts({ sellerId: id });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!profile) return <div className="p-8 text-center">Profile not found</div>;

  return (
    <div className="animate-fade-in pb-4">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Profile</h1>
      </div>

      <div className="flex flex-col items-center px-4 py-4">
        <UserAvatar icon={profile.avatar_icon} avatar={profile.avatar_url} size="xl" />
        <div className="flex items-center gap-1.5 mt-3">
          <h2 className="text-lg font-bold">{profile.name || "User"}</h2>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {profile.location || "Unknown"}</p>

        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="text-center">
            <p className="font-bold">{products?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Products</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{profile.country}</p>
            <p className="text-[10px] text-muted-foreground">Country</p>
          </div>
        </div>
      </div>

      {(profile.report_count || 0) >= 3 && <div className="px-4 pb-3"><DangerSellerBanner /></div>}

      <div className="flex gap-2 px-4 pb-4">
        <button onClick={() => navigate(`/inbox?to=${profile.user_id}`)} className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"><MessageSquare className="h-4 w-4" /> Message</button>
        <button onClick={() => navigate(`/shop/${profile.user_id}`)} className="flex-1 border border-border py-2 rounded-xl text-sm font-semibold">View Shop</button>
      </div>

      <div className="px-4">
        <h3 className="font-bold mb-2">Products</h3>
        <div className="grid grid-cols-2 gap-3">
          {products?.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        {products?.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No products yet</p>}
      </div>
    </div>
  );
}
