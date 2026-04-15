import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Image, Loader2, CheckCircle, Rocket, TrendingUp } from "lucide-react";
import { CATEGORIES } from "@/lib/mockData";

export default function SellPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "uploading" | "success">("form");
  const [progress, setProgress] = useState(0);
  const [showBoostPrompt, setShowBoostPrompt] = useState(false);

  const [form, setForm] = useState({
    title: "", price: "", description: "", condition: "New",
    category: "Electronics", location: "", shipping: true, images: [] as string[],
  });

  const handleSubmit = () => {
    setStep("uploading");
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setStep("success");
          setTimeout(() => setShowBoostPrompt(true), 1000);
        }, 500);
      }
      setProgress(Math.min(100, Math.round(p)));
    }, 300);
  };

  if (step === "uploading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in px-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="font-semibold">Uploading product...</p>
        <div className="w-full max-w-xs bg-muted rounded-full h-3 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">{progress}%</p>
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
      <p className="px-4 text-xs text-muted-foreground mb-3">You can upload up to 3 products. 3 posts per week allowed.</p>

      <div className="px-4 space-y-4 pb-8">
        {/* Image upload */}
        <div>
          <label className="text-sm font-medium">Photos (up to 3)</label>
          <div className="flex gap-2 mt-1.5">
            {[0, 1, 2].map(i => (
              <button key={i} className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors">
                <Image className="h-6 w-6 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add</span>
              </button>
            ))}
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
          <div className="flex gap-2 mt-1.5">
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
          <button
            onClick={() => setForm({ ...form, shipping: !form.shipping })}
            className={`w-11 h-6 rounded-full transition-colors ${form.shipping ? "bg-primary" : "bg-muted"}`}
          >
            <div className={`w-5 h-5 bg-card rounded-full shadow transition-transform ${form.shipping ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <button onClick={handleSubmit} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
          <Upload className="h-5 w-5" /> List Product
        </button>
      </div>
    </div>
  );
}
