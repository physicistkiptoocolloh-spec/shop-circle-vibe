import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Star, MessageSquare, Archive, Edit, Eye, ShoppingBag,
  Rocket, ShieldCheck, BarChart3, AlertTriangle, User, Store, PlusCircle,
  Mail, Settings as SettingsIcon, TrendingUp, CheckCircle, XCircle,
  Trash2, Tag, RotateCcw, ThumbsUp, Send, ArrowLeft
} from "lucide-react";
import { MOCK_PRODUCTS, MOCK_SELLERS, MOCK_REVIEWS, BOOST_TIERS, VERIFICATION_TIERS, Product } from "@/lib/mockData";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerificationBadge } from "@/components/shared/VerificationBadge";
import { StarRating } from "@/components/shared/StarRating";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const SELLER = MOCK_SELLERS[0];

type DashView = "main" | "products" | "reviews" | "archived" | "soldout" | "contact" | "edit-product";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [view, setView] = useState<DashView>("main");
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Local product state for actions
  const [products, setProducts] = useState<Product[]>(
    MOCK_PRODUCTS.filter(p => p.sellerId === SELLER.id)
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ title: "", price: "", description: "" });

  // Contact admin form
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });

  // Review reply
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const myReviews = MOCK_REVIEWS.filter(r => products.some(p => p.id === r.productId));
  const activeProducts = products.filter(p => !p.isArchived && !p.isSoldOut);
  const archivedProducts = products.filter(p => p.isArchived);
  const soldOutProducts = products.filter(p => p.isSoldOut);
  const totalViews = products.reduce((a, p) => a + p.views, 0);

  const handleArchive = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isArchived: true } : p));
    toast({ title: "Product archived", description: "You can restore it from the Archived section." });
  };

  const handleUnarchive = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isArchived: false } : p));
    toast({ title: "Product restored" });
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setShowDeleteConfirm(null);
    toast({ title: "Product deleted", variant: "destructive" });
  };

  const handleMarkSoldOut = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isSoldOut: true } : p));
    toast({ title: "Marked as sold out" });
  };

  const handleUnmarkSoldOut = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isSoldOut: false } : p));
    toast({ title: "Marked as available" });
  };

  const handleEditStart = (product: Product) => {
    setEditingProduct(product);
    setEditForm({ title: product.title, price: String(product.price), description: product.description });
    setView("edit-product");
  };

  const handleEditSave = () => {
    if (!editingProduct) return;
    setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
      ...p, title: editForm.title, price: Number(editForm.price), description: editForm.description
    } : p));
    toast({ title: "Product updated" });
    setView("products");
    setEditingProduct(null);
  };

  const handleContactSubmit = () => {
    toast({ title: "Message sent to admin", description: "We'll get back to you within 24 hours." });
    setContactForm({ subject: "", message: "" });
    setView("main");
  };

  const features = [
    { icon: Package, label: "My Products", count: activeProducts.length, action: () => setView("products") },
    { icon: Star, label: "Reviews", count: myReviews.length, action: () => setView("reviews") },
    { icon: MessageSquare, label: "Inbox", action: () => navigate("/inbox") },
    { icon: Archive, label: "Archived", count: archivedProducts.length, action: () => setView("archived") },
    { icon: CheckCircle, label: "Sold Out", count: soldOutProducts.length, action: () => setView("soldout") },
    { icon: Edit, label: "Edit Profile", action: () => navigate("/profile/edit") },
    { icon: Eye, label: "View Shop", action: () => navigate(`/shop/${SELLER.id}`) },
    { icon: PlusCircle, label: "Add Product", action: () => navigate("/sell") },
    { icon: SettingsIcon, label: "Shop Features", action: () => navigate("/settings") },
    { icon: Mail, label: "Contact Admin", action: () => setView("contact") },
  ];

  // Sub-header for inner views
  const SubHeader = ({ title }: { title: string }) => (
    <div className="px-4 py-3 flex items-center gap-3 border-b border-border">
      <button onClick={() => setView("main")} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
      <h1 className="font-bold text-lg">{title}</h1>
    </div>
  );

  // Product list item with actions
  const ProductItem = ({ product, showRestore }: { product: Product; showRestore?: boolean }) => (
    <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
      <img src={product.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{product.title}</p>
        <p className="text-xs text-primary font-bold">{product.currency} {product.price.toLocaleString()}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Eye className="h-3 w-3" /> {product.views}</span>
          {product.isSoldOut && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">Sold Out</span>}
          {product.isArchived && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">Archived</span>}
          {product.isBoosted && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5"><Rocket className="h-2.5 w-2.5" />Boosted</span>}
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        {!showRestore && (
          <>
            <button onClick={() => handleEditStart(product)} className="text-[10px] bg-accent text-accent-foreground px-2.5 py-1 rounded-md font-medium flex items-center gap-1"><Edit className="h-3 w-3" />Edit</button>
            {!product.isSoldOut ? (
              <button onClick={() => handleMarkSoldOut(product.id)} className="text-[10px] bg-warning/10 text-warning px-2.5 py-1 rounded-md font-medium flex items-center gap-1"><Tag className="h-3 w-3" />Sold Out</button>
            ) : (
              <button onClick={() => handleUnmarkSoldOut(product.id)} className="text-[10px] bg-success/10 text-success px-2.5 py-1 rounded-md font-medium flex items-center gap-1"><RotateCcw className="h-3 w-3" />Restock</button>
            )}
            <button onClick={() => handleArchive(product.id)} className="text-[10px] bg-muted text-muted-foreground px-2.5 py-1 rounded-md font-medium flex items-center gap-1"><Archive className="h-3 w-3" />Archive</button>
            <button onClick={() => setShowDeleteConfirm(product.id)} className="text-[10px] bg-destructive/10 text-destructive px-2.5 py-1 rounded-md font-medium flex items-center gap-1"><Trash2 className="h-3 w-3" />Delete</button>
          </>
        )}
        {showRestore && (
          <>
            <button onClick={() => handleUnarchive(product.id)} className="text-[10px] bg-success/10 text-success px-2.5 py-1 rounded-md font-medium flex items-center gap-1"><RotateCcw className="h-3 w-3" />Restore</button>
            <button onClick={() => setShowDeleteConfirm(product.id)} className="text-[10px] bg-destructive/10 text-destructive px-2.5 py-1 rounded-md font-medium flex items-center gap-1"><Trash2 className="h-3 w-3" />Delete</button>
          </>
        )}
      </div>
    </div>
  );

  // ── EDIT PRODUCT VIEW ──
  if (view === "edit-product" && editingProduct) {
    return (
      <div className="animate-fade-in pb-8">
        <SubHeader title="Edit Product" />
        <div className="px-4 mt-4 space-y-4">
          <div className="flex gap-2">
            {editingProduct.images.map((img, i) => (
              <img key={i} src={img} alt="" className="w-20 h-20 rounded-lg object-cover" />
            ))}
          </div>
          <div>
            <label className="text-sm font-medium">Title</label>
            <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium">Price (KES)</label>
            <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={4} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:ring-2 ring-primary/30" />
          </div>
          <button onClick={handleEditSave} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm">Save Changes</button>
        </div>
      </div>
    );
  }

  // ── PRODUCTS VIEW ──
  if (view === "products") {
    return (
      <div className="animate-fade-in pb-8">
        <SubHeader title={`My Products (${activeProducts.length})`} />
        <div className="px-4 mt-3 space-y-2">
          {activeProducts.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No active products</p>}
          {activeProducts.map(p => <ProductItem key={p.id} product={p} />)}
        </div>
      </div>
    );
  }

  // ── ARCHIVED VIEW ──
  if (view === "archived") {
    return (
      <div className="animate-fade-in pb-8">
        <SubHeader title={`Archived (${archivedProducts.length})`} />
        <div className="px-4 mt-3 space-y-2">
          {archivedProducts.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No archived products</p>}
          {archivedProducts.map(p => <ProductItem key={p.id} product={p} showRestore />)}
        </div>
      </div>
    );
  }

  // ── SOLD OUT VIEW ──
  if (view === "soldout") {
    return (
      <div className="animate-fade-in pb-8">
        <SubHeader title={`Sold Out (${soldOutProducts.length})`} />
        <div className="px-4 mt-3 space-y-2">
          {soldOutProducts.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No sold out products</p>}
          {soldOutProducts.map(p => <ProductItem key={p.id} product={p} />)}
        </div>
      </div>
    );
  }

  // ── REVIEWS VIEW ──
  if (view === "reviews") {
    return (
      <div className="animate-fade-in pb-8">
        <SubHeader title={`Reviews (${myReviews.length})`} />
        <div className="px-4 mt-3 space-y-4">
          {myReviews.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No reviews yet</p>}
          {myReviews.map(review => {
            const product = products.find(p => p.id === review.productId);
            return (
              <div key={review.id} className="bg-card border border-border rounded-xl p-4">
                {product && (
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                    <img src={product.images[0]} alt="" className="w-8 h-8 rounded-md object-cover" />
                    <span className="text-xs font-medium truncate">{product.title}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <UserAvatar icon={review.userAvatarIcon} size="sm" />
                  <span className="text-sm font-semibold">{review.userName}</span>
                  <StarRating rating={review.rating} size={12} />
                </div>
                <p className="text-sm mt-2 text-foreground/80">{review.text}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><ThumbsUp className="h-3 w-3" /> {review.likes}</span>
                  <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Existing replies */}
                {review.replies.map(reply => (
                  <div key={reply.id} className="ml-6 mt-3 pl-3 border-l-2 border-primary/20">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold">{reply.userName}</span>
                      {reply.isSeller && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">You</span>}
                    </div>
                    <p className="text-xs text-foreground/70 mt-0.5">{reply.text}</p>
                  </div>
                ))}

                {/* Reply input */}
                {replyingTo === review.id ? (
                  <div className="mt-3 ml-6 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        toast({ title: "Reply sent!" });
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      className="p-2 bg-primary rounded-lg text-primary-foreground"
                    >
                      <Send className="h-3 w-3" />
                    </button>
                    <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="text-xs text-muted-foreground">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setReplyingTo(review.id)} className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> Reply
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── CONTACT ADMIN VIEW ──
  if (view === "contact") {
    return (
      <div className="animate-fade-in pb-8">
        <SubHeader title="Contact Admin" />
        <div className="px-4 mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">Have an issue or suggestion? Fill out the form below and our team will get back to you within 24 hours.</p>
          <div>
            <label className="text-sm font-medium">Subject</label>
            <input type="text" value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} placeholder="What's this about?" className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <textarea value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} rows={5} placeholder="Describe your issue or suggestion..." className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:ring-2 ring-primary/30" />
          </div>
          <button onClick={handleContactSubmit} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"><Send className="h-4 w-4" /> Submit</button>
        </div>
      </div>
    );
  }

  // ── MAIN DASHBOARD ──
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
            { label: "Products", value: activeProducts.length },
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

      {/* Quick products overview */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold">My Products</h2>
          <button onClick={() => setView("products")} className="text-xs text-primary font-medium">View All</button>
        </div>
        <div className="space-y-2">
          {activeProducts.slice(0, 3).map(product => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center px-6" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-card rounded-2xl w-full max-w-sm p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <Trash2 className="h-10 w-10 text-destructive mx-auto" />
            <h3 className="font-bold text-center mt-3">Delete Product?</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">This action cannot be undone.</p>
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
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
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
