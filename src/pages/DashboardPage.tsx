import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Star, MessageSquare, Archive, Edit, Eye, ShoppingBag,
  Rocket, ShieldCheck, BarChart3, AlertTriangle, User, Store, PlusCircle,
  Mail, Settings as SettingsIcon, TrendingUp, CheckCircle, XCircle
} from "lucide-react";
import { MOCK_PRODUCTS, MOCK_SELLERS, MOCK_REVIEWS, BOOST_TIERS, VERIFICATION_TIERS } from "@/lib/mockData";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import { StarRating } from "@/components/shared/StarRating";
import { cn } from "@/lib/utils";

const SELLER = MOCK_SELLERS[0]; // Current user as seller

export default function DashboardPage() {
  const navigate = useNavigate();
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);

  const myProducts = MOCK_PRODUCTS.filter(p => p.sellerId === SELLER.id);
  const myReviews = MOCK_REVIEWS.filter(r => myProducts.some(p => p.id === r.productId));
  const totalViews = myProducts.reduce((a, p) => a + p.views, 0);

  const features = [
    { icon: Package, label: "My Products", count: myProducts.length, action: () => {} },
    { icon: Star, label: "Reviews", count: myReviews.length, action: () => {} },
    { icon: MessageSquare, label: "Inbox", action: () => navigate("/inbox") },
    { icon: Archive, label: "Archived", count: myProducts.filter(p => p.isArchived).length, action: () => {} },
    { icon: CheckCircle, label: "Sold Out", count: myProducts.filter(p => p.isSoldOut).length, action: () => {} },
    { icon: Edit, label: "Edit Profile", action: () => navigate("/profile/edit") },
    { icon: Eye, label: "View Shop", action: () => navigate(`/shop/${SELLER.id}`) },
    { icon: PlusCircle, label: "Add Product", action: () => navigate("/sell") },
    { icon: SettingsIcon, label: "Shop Features", action: () => {} },
    { icon: Mail, label: "Contact Admin", action: () => {} },
  ];

  return (
    <div className="animate-fade-in pb-4">
      {/* Profile header */}
      <div className="px-4 py-4 bg-gradient-to-br from-primary/10 to-accent">
        <div className="flex items-center gap-3">
          <UserAvatar icon={SELLER.avatarIcon} avatar={SELLER.avatar} size="xl" />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold">{SELLER.name}</h1>
              <VerificationBadge tier={SELLER.verificationTier} size={20} />
            </div>
            <p className="text-xs text-muted-foreground">{SELLER.location}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: "Products", value: myProducts.length },
            { label: "Sales", value: SELLER.totalSales },
            { label: "Views", value: totalViews },
            { label: "Rating", value: SELLER.rating },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl p-2 text-center">
              <p className="text-lg font-bold text-primary">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Boost & Verify buttons */}
      <div className="px-4 py-3 flex gap-2">
        <button onClick={() => setShowBoostModal(true)} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5">
          <Rocket className="h-4 w-4" /> Boost Sales
        </button>
        <button onClick={() => setShowVerifyModal(true)} className="flex-1 bg-accent text-accent-foreground py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4" /> Get Verified
        </button>
      </div>

      {/* Promo banner */}
      <div className="mx-4 p-3 bg-primary/5 border border-primary/20 rounded-xl mb-3">
        <p className="text-sm font-semibold text-primary flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Did you know?</p>
        <p className="text-xs text-muted-foreground mt-1">You can get up to 1,000 views per day! Click Boost Sales to get started.</p>
      </div>

      {/* Features grid */}
      <div className="px-4">
        <h2 className="font-bold mb-2">Dashboard</h2>
        <div className="grid grid-cols-2 gap-2">
          {features.map(f => (
            <button key={f.label} onClick={f.action} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-accent transition-colors text-left">
              <f.icon className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                {f.count !== undefined && <p className="text-xs text-muted-foreground">{f.count} items</p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Admin warnings */}
      <div className="px-4 mt-4">
        <h2 className="font-bold mb-2">Notifications</h2>
        <div className="space-y-2">
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold">Admin Warning</p>
              <p className="text-[11px] text-muted-foreground">Please ensure your product descriptions are accurate. First warning.</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Products list */}
      <div className="px-4 mt-4">
        <h2 className="font-bold mb-2">My Products</h2>
        <div className="space-y-2">
          {myProducts.map(product => (
            <div key={product.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
              <img src={product.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.title}</p>
                <p className="text-xs text-primary font-bold">{product.currency} {product.price.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Eye className="h-3 w-3" /> {product.views}</span>
                  {product.isSoldOut && <span className="text-[10px] text-destructive font-medium">Sold Out</span>}
                  {product.isArchived && <span className="text-[10px] text-muted-foreground">Archived</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button className="text-[10px] bg-accent text-accent-foreground px-2 py-1 rounded-md">Edit</button>
                <button className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-md">Archive</button>
                <button className="text-[10px] bg-destructive/10 text-destructive px-2 py-1 rounded-md">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Boost Modal */}
      {showBoostModal && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center" onClick={() => setShowBoostModal(false)}>
          <div className="bg-card rounded-t-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" /> Boost Sales</h2>
              <button onClick={() => setShowBoostModal(false)} className="text-muted-foreground"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              {BOOST_TIERS.map(tier => (
                <div key={tier.id} className="border border-border rounded-xl p-4 hover:border-primary transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold" style={{ color: tier.color }}>{tier.name}</h3>
                    <span className="font-bold text-primary">{tier.currency} {tier.price}/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Up to {tier.viewsPerDay} views/day</p>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {tier.benefits.map(b => (
                      <p key={b} className="text-[11px] text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success flex-shrink-0" /> {b}</p>
                    ))}
                  </div>
                  <button className="w-full mt-3 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold">Choose Plan</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center" onClick={() => setShowVerifyModal(false)}>
          <div className="bg-card rounded-t-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Profile Verification</h2>
              <button onClick={() => setShowVerifyModal(false)} className="text-muted-foreground"><XCircle className="h-5 w-5" /></button>
            </div>
            <p className="px-4 pt-3 text-xs text-muted-foreground">All plans include a free 3-day trial!</p>
            <div className="p-4 space-y-4">
              {VERIFICATION_TIERS.map(tier => (
                <div key={tier.id} className="border border-border rounded-xl p-4 hover:border-primary transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold" style={{ color: tier.color }}>{tier.name}</h3>
                    <span className="font-bold text-primary">{tier.currency} {tier.price}/mo</span>
                  </div>
                  <p className="text-[11px] text-success mt-1">{tier.trialDays}-day free trial</p>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {tier.benefits.map(b => (
                      <p key={b} className="text-[11px] text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success flex-shrink-0" /> {b}</p>
                    ))}
                  </div>
                  <button className="w-full mt-3 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold">Start Free Trial</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
