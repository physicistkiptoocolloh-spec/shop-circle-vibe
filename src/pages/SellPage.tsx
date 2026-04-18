import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Image, Loader2, CheckCircle, Rocket, TrendingUp, X, AlertTriangle, ShieldCheck } from "lucide-react";
import { CATEGORIES, HIGH_VALUE_CATEGORIES, HIGH_VALUE_THRESHOLD } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProduct } from "@/hooks/useProducts";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";

export default function SellPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const createProduct = useCreateProduct();
  const { data: subscription } = useSubscription(user?.id);
  const [step, setStep] = useState<"form" | "uploading" | "success">("form");
  const [progress, setProgress] = useState(0);
  const [showBoostPrompt, setShowBoostPrompt] = useState(false);
  const [showVerifyGate, setShowVerifyGate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canPost, setCanPost] = useState(true);
  const [checkingLimit, setCheckingLimit] = useState(true);

  useEffect(() => {
    if (!user) return;
    setCheckingLimit(true);
    supabase.rpc("check_daily_product_limit", { _user_id: user.id }).then(({ data }) => {
      setCanPost(data === true);
      setCheckingLimit(false);
    });
  }, [user]);

  const [form, setForm] = useState({
    title: "", price: "", description: "", condition: "New",
    category: "Electronics", location: "", shipping: true,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <p className="text-sm text-muted-foreground">You need to sign in to sell products.</p>
        <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm">Sign In</button>
      </div>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const isHighValue =
    HIGH_VALUE_CATEGORIES.includes(form.category) ||
    Number(form.price) >= HIGH_VALUE_THRESHOLD;

  const handleSubmit = async () => {
    if (!user || !form.title || !form.price) return;

    // Gate high-value listings behind seller verification
    if (isHighValue && !subscription?.isVerified) {
      setShowVerifyGate(true);
      return;
    }

    setStep("uploading");
    setProgress(10);

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${i}.${ext}`;
        setProgress(10 + (i + 1) / imageFiles.length * 50);

        const { error } = await supabase.storage.from("product-images").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }

      setProgress(70);

      // Create product
      await createProduct.mutateAsync({
        seller_id: user.id,
        title: form.title,
        price: Number(form.price),
        description: form.description,
        condition: form.condition,
        category: form.category,
        location: form.location,
        shipping: form.shipping,
        images: imageUrls,
      });

      setProgress(100);
      setStep("success");
      setTimeout(() => setShowBoostPrompt(true), 1000);
    } catch (err) {
      console.error(err);
      setStep("form");
    }
  };

  if (step === "uploading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in px-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="font-semibold">Uploading product...</p>
        <div className="w-full max-w-xs bg-muted rounded-full h-3 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in px-4">
        <CheckCircle className="h-16 w-16 text-success" />
        <h2 className="text-xl font-bold">Product Listed!</h2>
        <p className="text-sm text-muted-foreground text-center">Your product is now visible to everyone on SokoMtaani.</p>
        {showBoostPrompt && (
          <div className="w-full max-w-sm p-4 bg-primary/5 border border-primary/20 rounded-xl animate-fade-in">
            <p className="font-semibold text-sm flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-primary" /> Get up to 1,000 views per day!</p>
            <p className="text-xs text-muted-foreground mt-1">Boost your product to reach more buyers instantly.</p>
            <button onClick={() => navigate("/dashboard")} className="w-full mt-3 bg-primary text-primary-foreground py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5">
              <Rocket className="h-4 w-4" /> Boost Now
            </button>
          </div>
        )}
        <button onClick={() => navigate("/")} className="text-sm text-primary font-medium mt-2">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Sell Product</h1>
      </div>
      {checkingLimit ? (
        <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : !canPost ? (
        <div className="mx-4 mb-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">Daily limit reached</p>
            <p className="text-xs text-muted-foreground mt-1">You've hit today's product limit. Boost your account to list up to 999 products/day, or get verified for 10/day.</p>
            <button onClick={() => navigate("/dashboard")} className="mt-2 text-xs font-semibold text-primary flex items-center gap-1"><Rocket className="h-3 w-3" /> Upgrade now</button>
          </div>
        </div>
      ) : null}
      {isHighValue && !subscription?.isVerified && (
        <div className="mx-4 mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-2">
          <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">Verification required</p>
            <p className="text-xs text-muted-foreground mt-1">High-value listings (vehicles, real estate, ≥{HIGH_VALUE_THRESHOLD.toLocaleString()} KES) require a verified profile to protect buyers.</p>
            <button onClick={() => navigate("/dashboard")} className="mt-1.5 text-xs font-semibold text-primary flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Get verified (free)</button>
          </div>
        </div>
      )}
      <p className="px-4 text-xs text-muted-foreground mb-3">Upload up to 3 photos. Free accounts: 3 products/day. Boosted: unlimited.</p>

      <div className="px-4 space-y-4 pb-8">
        {/* Image upload */}
        <div>
          <label className="text-sm font-medium">Photos (up to 3)</label>
          <input type="file" ref={fileInputRef} accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
          <div className="flex gap-2 mt-1.5">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-24 h-24">
                <img src={src} alt="" className="w-full h-full rounded-xl object-cover" />
                <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"><X className="h-3 w-3 text-destructive-foreground" /></button>
              </div>
            ))}
            {imagePreviews.length < 3 && (
              <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors">
                <Image className="h-6 w-6 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add</span>
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Title</label>
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Samsung Galaxy S24" className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/30" />
        </div>

        <div>
          <label className="text-sm font-medium">Price (KES)</label>
          <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/30" />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your product..." rows={3} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:ring-2 ring-primary/30" />
        </div>

        <div>
          <label className="text-sm font-medium">Condition</label>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            {["New", "Like New", "Used", "Refurbished"].map(c => (
              <button key={c} onClick={() => setForm({ ...form, condition: c })} className={`text-xs px-3 py-1.5 rounded-full font-medium ${form.condition === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{c}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Location</label>
          <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Nairobi, Kenya" className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/30" />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Shipping available?</label>
          <button onClick={() => setForm({ ...form, shipping: !form.shipping })} className={`w-11 h-6 rounded-full transition-colors ${form.shipping ? "bg-primary" : "bg-muted"}`}>
            <div className={`w-5 h-5 bg-card rounded-full shadow transition-transform ${form.shipping ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <button onClick={handleSubmit} disabled={!form.title || !form.price || !canPost || checkingLimit} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform">
          <Upload className="h-5 w-5" /> List Product
        </button>
      </div>

      {showVerifyGate && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center px-6" onClick={() => setShowVerifyGate(false)}>
          <div className="bg-card rounded-2xl w-full max-w-sm p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
            <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
            <h3 className="font-bold text-center mt-3 text-lg">Verify to list this</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Listings in <strong>{form.category}</strong>{Number(form.price) >= HIGH_VALUE_THRESHOLD ? ` or above KES ${HIGH_VALUE_THRESHOLD.toLocaleString()}` : ""} require a verified profile. Verification is now free — get your badge in seconds.
            </p>
            <div className="flex flex-col gap-2 mt-5">
              <button onClick={() => navigate("/dashboard")} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold active:scale-95 transition-transform">Get Verified Free</button>
              <button onClick={() => setShowVerifyGate(false)} className="w-full py-2 text-xs text-muted-foreground">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
