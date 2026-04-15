import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, ShoppingBag, Star, MessageSquare } from "lucide-react";
import { MOCK_SELLERS, MOCK_PRODUCTS } from "@/lib/mockData";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import { DangerSellerBanner } from "@/components/shared/DangerSellerBanner";
import { ProductCard } from "@/components/shared/ProductCard";

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const seller = MOCK_SELLERS.find(s => s.id === id);
  if (!seller) return <div className="p-8 text-center">Profile not found</div>;

  const products = MOCK_PRODUCTS.filter(p => p.sellerId === seller.id && !p.isArchived);

  return (
    <div className="animate-fade-in pb-4">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Profile</h1>
      </div>

      <div className="flex flex-col items-center px-4 py-4">
        <UserAvatar icon={seller.avatarIcon} avatar={seller.avatar} size="xl" />
        <div className="flex items-center gap-1.5 mt-3">
          <h2 className="text-lg font-bold">{seller.name}</h2>
          <VerificationBadge tier={seller.verificationTier} size={20} />
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {seller.location}</p>

        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="text-center">
            <p className="font-bold">{seller.rating}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" /> Rating</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{seller.totalSales}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><ShoppingBag className="h-3 w-3" /> Sales</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{products.length}</p>
            <p className="text-[10px] text-muted-foreground">Products</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{seller.joinedYear}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Calendar className="h-3 w-3" /> Joined</p>
          </div>
        </div>
      </div>

      {seller.reportCount >= 3 && <div className="px-4 pb-3"><DangerSellerBanner /></div>}

      <div className="flex gap-2 px-4 pb-4">
        <button onClick={() => navigate(`/inbox?to=${seller.id}`)} className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"><MessageSquare className="h-4 w-4" /> Message</button>
        <button onClick={() => navigate(`/shop/${seller.id}`)} className="flex-1 border border-border py-2 rounded-xl text-sm font-semibold">View Shop</button>
      </div>

      <div className="px-4">
        <h3 className="font-bold mb-2">Products</h3>
        <div className="grid grid-cols-2 gap-3">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
