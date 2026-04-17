import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Package, Star, MessageSquare, Archive, Edit, Eye, ShoppingBag,
  Rocket, ShieldCheck, AlertTriangle, PlusCircle,
  Mail, Settings as SettingsIcon, TrendingUp, CheckCircle, XCircle,
  Trash2, Tag, RotateCcw, Send, ArrowLeft, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMyProducts, useUpdateProduct, useDeleteProduct, type DbProduct } from "@/hooks/useProducts";
import { useReviewsBySellerProducts, useCreateReviewReply } from "@/hooks/useReviews";
import { useSubscription } from "@/hooks/useSubscription";
import { BOOST_TIERS, VERIFICATION_TIERS } from "@/lib/mockData";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { StarRating } from "@/components/shared/StarRating";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { startCheckout } from "@/lib/checkout";

type DashView = "main" | "products" | "reviews" | "archived" | "soldout" | "contact" | "edit-product";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<DashView>("main");
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [editForm, setEditForm] = useState({ title: "", price: "", description: "" });
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [purchasingTier, setPurchasingTier] = useState<string | null>(null);

  const { data: products, isLoading } = useMyProducts(user?.id);
  const { data: subscription } = useSubscription(user?.id);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createReply = useCreateReviewReply();

  // Handle PesaPal payment callback
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      const t = searchParams.get("type");
      toast({ title: "Payment received!", description: `Your ${t} subscription is now active.` });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, toast]);

  const handlePurchase = async (type: "boost" | "verification", tier: any) => {
    if (!user) return;
    const key = `${type}-${tier.id}`;
    setPurchasingTier(key);
    toast({ title: "Processing payment...", description: "Redirecting to PesaPal secure checkout." });
    try {
      await startCheckout({
        type,
        tierId: tier.id,
        amount: tier.price,
        currency: tier.currency,
        description: `${tier.name} - SokoMtaani`,
        durationDays: type === "boost" ? 30 : 30,
        user: { id: user.id, email: user.email, phone: profile?.phone, name: profile?.name },
      });
    } catch (e: any) {
      toast({ title: "Payment failed", description: e.message, variant: "destructive" });
      setPurchasingTier(null);
    }
  };

  const activeProducts = products?.filter(p => !p.is_archived && !p.is_sold_out) || [];
  const archivedProducts = products?.filter(p => p.is_archived) || [];
  const soldOutProducts = products?.filter(p => p.is_sold_out) || [];
  const productIds = products?.map(p => p.id) || [];
  const { data: reviews } = useReviewsBySellerProducts(productIds);
  const totalViews = products?.reduce((a, p) => a + (p.views || 0), 0) || 0;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <p className="text-sm text-muted-foreground">Sign in to access your dashboard.</p>
        <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm">Sign In</button>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const handleArchive = (id: string) => { updateProduct.mutate({ id, is_archived: true }); toast({ title: "Archived" }); };
  const handleUnarchive = (id: string) => { updateProduct.mutate({ id, is_archived: false }); toast({ title: "Restored" }); };
  const handleDelete = (id: string) => { deleteProduct.mutate(id); setShowDeleteConfirm(null); toast({ title: "Deleted", variant: "destructive" }); };
  const handleMarkSold = (id: string) => { updateProduct.mutate({ id, is_sold_out: true }); toast({ title: "Marked sold out" }); };
  const handleUnmarkSold = (id: string) => { updateProduct.mutate({ id, is_sold_out: false }); toast({ title: "Restocked" }); };

  const handleEditStart = (p: DbProduct) => {
    setEditingProduct(p);
    setEditForm({ title: p.title, price: String(p.price), description: p.description || "" });
    setView("edit-product");
  };
  const handleEditSave = () => {
    if (!editingProduct) return;
    updateProduct.mutate({ id: editingProduct.id, title: editForm.title, price: Number(editForm.price) as any, description: editForm.description });
    toast({ title: "Updated" });
    setView("products");
  };

  const features = [
    { icon: Package, label: "My Products", count: activeProducts.length, action: () => setView("products") },
    { icon: Star, label: "Reviews", count: reviews?.length || 0, action: () => setView("reviews") },
    { icon: MessageSquare, label: "Inbox", action: () => navigate("/inbox") },
    { icon: Archive, label: "Archived", count: archivedProducts.length, action: () => setView("archived") },
    { icon: CheckCircle, label: "Sold Out", count: soldOutProducts.length, action: () => setView("soldout") },
    { icon: Edit, label: "Edit Profile", action: () => navigate("/profile/edit") },
    { icon: Eye, label: "View Shop", action: () => navigate(`/shop/${user?.id}`) },
    { icon: PlusCircle, label: "Add Product", action: () => navigate("/sell") },
    { icon: SettingsIcon, label: "Settings", action: () => navigate("/settings") },
    { icon: Mail, label: "Contact Admin", action: () => setView("contact") },
  ];

  const SubHeader = ({ title }: { title: string }) => (
    <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
      <button onClick={() => setView("main")} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
      <h1 className="font-bold text-lg">{title}</h1>
    </div>
  );

  const ProductItem = ({ product, showRestore }: { product: DbProduct; showRestore?: boolean }) => (
    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
      {product.images?.[0] ? (
        <img src={product.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{product.title}</p>
        <p className="text-xs text-primary font-bold">{product.currency} {Number(product.price).toLocaleString()}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Eye className="h-3 w-3" /> {product.views}</span>
          {product.is_sold_out && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">Sold Out</span>}
          {product.is_boosted && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5"><Rocket className="h-2.5 w-2.5" />Boosted</span>}
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        {!showRestore ? (
          <>
            <button onClick={() => handleEditStart(product)} className="text-[10px] bg-accent text-accent-foreground px-2.5 py-1 rounded-md font-medium">Edit</button>
            {!product.is_sold_out ? (
              <button onClick={() => handleMarkSold(product.id)} className="text-[10px] bg-warning/10 text-warning px-2.5 py-1 rounded-md font-medium">Sold Out</button>
            ) : (
              <button onClick={() => handleUnmarkSold(product.id)} className="text-[10px] bg-success/10 text-success px-2.5 py-1 rounded-md font-medium">Restock</button>
            )}
            <button onClick={() => handleArchive(product.id)} className="text-[10px] bg-muted text-muted-foreground px-2.5 py-1 rounded-md font-medium">Archive</button>
            <button onClick={() => setShowDeleteConfirm(product.id)} className="text-[10px] bg-destructive/10 text-destructive px-2.5 py-1 rounded-md font-medium">Delete</button>
          </>
        ) : (
          <>
            <button onClick={() => handleUnarchive(product.id)} className="text-[10px] bg-success/10 text-success px-2.5 py-1 rounded-md font-medium">Restore</button>
            <button onClick={() => setShowDeleteConfirm(product.id)} className="text-[10px] bg-destructive/10 text-destructive px-2.5 py-1 rounded-md font-medium">Delete</button>
          </>
        )}
      </div>
    </div>
  );

  // ── Edit product ──
  if (view === "edit-product" && editingProduct) {
    return (
      <div className="animate-fade-in pb-8">
        <SubHeader title="Edit Product" />
        <div className="px-4 mt-4 space-y-4">
          <div><label className="text-sm font-medium">Title</label><input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
          <div><label className="text-sm font-medium">Price</label><input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
          <div><label className="text-sm font-medium">Description</label><textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={4} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none resize-none" /></div>
          <button onClick={handleEditSave} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm">Save Changes</button>
        </div>
      </div>
    );
  }

  // ── List views ──
  if (view === "products") return <div className="animate-fade-in pb-8"><SubHeader title={`Products (${activeProducts.length})`} /><div className="px-4 mt-3 space-y-2">{activeProducts.map(p => <ProductItem key={p.id} product={p} />)}{activeProducts.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No products</p>}</div></div>;
  if (view === "archived") return <div className="animate-fade-in pb-8"><SubHeader title={`Archived (${archivedProducts.length})`} /><div className="px-4 mt-3 space-y-2">{archivedProducts.map(p => <ProductItem key={p.id} product={p} showRestore />)}{archivedProducts.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No archived products</p>}</div></div>;
  if (view === "soldout") return <div className="animate-fade-in pb-8"><SubHeader title={`Sold Out (${soldOutProducts.length})`} /><div className="px-4 mt-3 space-y-2">{soldOutProducts.map(p => <ProductItem key={p.id} product={p} />)}{soldOutProducts.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No sold out products</p>}</div></div>;

  // ── Reviews ──
  if (view === "reviews") {
    return (
      <div className="animate-fade-in pb-8">
        <SubHeader title={`Reviews (${reviews?.length || 0})`} />
        <div className="px-4 mt-3 space-y-4">
          {reviews?.map(review => {
            const product = products?.find(p => p.id === review.product_id);
            return (
              <div key={review.id} className="bg-card border border-border rounded-xl p-4">
                {product && (
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                    {product.images?.[0] && <img src={product.images[0]} alt="" className="w-8 h-8 rounded-md object-cover" />}
                    <span className="text-xs font-medium truncate">{product.title}</span>
                  </div>
                )}
                <StarRating rating={review.rating} size={12} />
                <p className="text-sm mt-2">{review.text}</p>
                {replyingTo === review.id ? (
                  <div className="mt-3 flex items-center gap-2">
                    <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs outline-none" autoFocus />
                    <button onClick={() => { if (user) { createReply.mutate({ review_id: review.id, user_id: user.id, text: replyText, is_seller: true }); setReplyingTo(null); setReplyText(""); toast({ title: "Reply sent!" }); } }} className="p-2 bg-primary rounded-lg text-primary-foreground"><Send className="h-3 w-3" /></button>
                    <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="text-xs text-muted-foreground">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setReplyingTo(review.id)} className="mt-2 text-xs text-primary font-medium flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Reply</button>
                )}
              </div>
            );
          })}
          {reviews?.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No reviews yet</p>}
        </div>
      </div>
    );
  }

  // ── Contact admin ──
  if (view === "contact") {
    return (
      <div className="animate-fade-in pb-8">
        <SubHeader title="Contact Admin" />
        <div className="px-4 mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
          <div><label className="text-sm font-medium">Subject</label><input type="text" value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
          <div><label className="text-sm font-medium">Message</label><textarea value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} rows={5} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none resize-none" /></div>
          <button onClick={() => { toast({ title: "Sent!" }); setContactForm({ subject: "", message: "" }); setView("main"); }} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm">Submit</button>
        </div>
      </div>
    );
  }

  // ── Main dashboard ──
  return (
    <div className="animate-fade-in pb-4">
      <div className="px-4 py-4 bg-gradient-to-br from-primary/10 to-accent">
        <div className="flex items-center gap-3">
          <UserAvatar icon={profile?.avatar_icon || "User"} avatar={profile?.avatar_url} size="xl" />
          <div>
            <h1 className="text-lg font-bold">{profile?.name || "Seller"}</h1>
            <p className="text-xs text-muted-foreground">{profile?.location || ""}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: "Products", value: products?.length || 0 },
            { label: "Active", value: activeProducts.length },
            { label: "Views", value: totalViews },
            { label: "Reviews", value: reviews?.length || 0 },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl p-2 text-center">
              <p className="text-lg font-bold text-primary">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 flex gap-2">
        <button onClick={() => setShowBoostModal(true)} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"><Rocket className="h-4 w-4" /> Boost Sales</button>
        <button onClick={() => setShowVerifyModal(true)} className="flex-1 bg-accent text-accent-foreground py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Get Verified</button>
      </div>

      <div className="mx-4 p-3 bg-primary/5 border border-primary/20 rounded-xl mb-3">
        <p className="text-sm font-semibold text-primary flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Get up to 1,000 views/day!</p>
        <p className="text-xs text-muted-foreground mt-1">Boost your products to reach more buyers.</p>
      </div>

      <div className="px-4">
        <h2 className="font-bold mb-2">Dashboard</h2>
        <div className="grid grid-cols-2 gap-2">
          {features.map(f => (
            <button key={f.label} onClick={f.action} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-accent transition-colors text-left">
              <f.icon className="h-5 w-5 text-primary flex-shrink-0" />
              <div><p className="text-sm font-medium">{f.label}</p>{f.count !== undefined && <p className="text-xs text-muted-foreground">{f.count} items</p>}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold">My Products</h2>
          <button onClick={() => setView("products")} className="text-xs text-primary font-medium">View All</button>
        </div>
        <div className="space-y-2">
          {activeProducts.slice(0, 3).map(p => <ProductItem key={p.id} product={p} />)}
          {activeProducts.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No products yet. <button onClick={() => navigate("/sell")} className="text-primary font-medium">List your first!</button></p>}
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center px-6" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-card rounded-2xl w-full max-w-sm p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <Trash2 className="h-10 w-10 text-destructive mx-auto" />
            <h3 className="font-bold text-center mt-3">Delete Product?</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">This cannot be undone.</p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Boost Modal */}
      {showBoostModal && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end justify-center" onClick={() => setShowBoostModal(false)}>
          <div className="bg-card rounded-t-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="font-bold text-lg flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" /> Boost Sales</h2>
              <button onClick={() => setShowBoostModal(false)}><XCircle className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="p-4 space-y-4">
              {BOOST_TIERS.map(tier => (
                <div key={tier.id} className="border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between"><h3 className="font-bold" style={{ color: tier.color }}>{tier.name}</h3><span className="font-bold text-primary">{tier.currency} {tier.price}/mo</span></div>
                  <p className="text-xs text-muted-foreground mt-1">Up to {tier.viewsPerDay} views/day</p>
                  <div className="mt-2 grid grid-cols-2 gap-1">{tier.benefits.map(b => <p key={b} className="text-[11px] text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success flex-shrink-0" /> {b}</p>)}</div>
                  <button onClick={() => handlePurchase("boost", tier)} disabled={!!purchasingTier || subscription?.isBoosted} className="w-full mt-3 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform">
                    {purchasingTier === `boost-${tier.id}` && <Loader2 className="h-4 w-4 animate-spin" />}
                    {purchasingTier === `boost-${tier.id}` ? "Processing..." : subscription?.isBoosted ? "Already Active" : "Choose Plan"}
                  </button>
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
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Verification</h2>
              <button onClick={() => setShowVerifyModal(false)}><XCircle className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <p className="px-4 pt-3 text-xs text-muted-foreground">All plans include a free 3-day trial!</p>
            <div className="p-4 space-y-4">
              {VERIFICATION_TIERS.map(tier => (
                <div key={tier.id} className="border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between"><h3 className="font-bold" style={{ color: tier.color }}>{tier.name}</h3><span className="font-bold text-primary">{tier.currency} {tier.price}/mo</span></div>
                  <p className="text-[11px] text-success mt-1">{tier.trialDays}-day free trial</p>
                  <div className="mt-2 grid grid-cols-2 gap-1">{tier.benefits.map(b => <p key={b} className="text-[11px] text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success flex-shrink-0" /> {b}</p>)}</div>
                  <button onClick={() => handlePurchase("verification", tier)} disabled={!!purchasingTier || subscription?.isVerified} className="w-full mt-3 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform">
                    {purchasingTier === `verification-${tier.id}` && <Loader2 className="h-4 w-4 animate-spin" />}
                    {purchasingTier === `verification-${tier.id}` ? "Processing..." : subscription?.isVerified ? "Already Verified" : "Start Free Trial"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
