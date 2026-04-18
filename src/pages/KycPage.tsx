import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, ShieldCheck, Clock, X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function KycPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [idNumber, setIdNumber] = useState("");
  const [selfie, setSelfie] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { data: existing, isLoading } = useQuery({
    queryKey: ["kyc", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("kyc_verifications").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) { setError("Selfie must be under 5MB"); return; }
    setSelfie(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const submit = async () => {
    if (!user) return;
    if (!/^[A-Za-z0-9]{4,20}$/.test(idNumber.trim())) { setError("Enter a valid ID number (4–20 alphanumeric)"); return; }
    if (!selfie) { setError("Please attach a selfie"); return; }
    setSubmitting(true); setError("");
    try {
      const ext = selfie.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("kyc-selfies").upload(path, selfie, { upsert: true });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("kyc_verifications").insert({
        user_id: user.id, id_number: idNumber.trim(), selfie_url: path, status: "pending",
      });
      if (insErr) throw insErr;
      qc.invalidateQueries({ queryKey: ["kyc", user.id] });
    } catch (e: any) {
      setError(e.message || "Failed to submit");
    } finally { setSubmitting(false); }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-3">Sign in to verify your identity</p>
        <button onClick={() => navigate("/auth")} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-semibold">Sign In</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-8">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 active:scale-95"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Identity Verification</h1>
      </div>

      <div className="px-4">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : existing ? (
          <div className="bg-muted rounded-2xl p-6 text-center">
            {existing.status === "approved" ? (
              <>
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                <h2 className="font-bold mt-3">Verified</h2>
                <p className="text-sm text-muted-foreground mt-1">Your identity has been confirmed.</p>
              </>
            ) : existing.status === "rejected" ? (
              <>
                <X className="h-12 w-12 text-destructive mx-auto" />
                <h2 className="font-bold mt-3">Rejected</h2>
                <p className="text-sm text-muted-foreground mt-1">{existing.rejection_reason || "Please resubmit with clearer documents."}</p>
              </>
            ) : (
              <>
                <Clock className="h-12 w-12 text-primary mx-auto" />
                <h2 className="font-bold mt-3">Under Review</h2>
                <p className="text-sm text-muted-foreground mt-1">Submitted {new Date(existing.submitted_at).toLocaleDateString()}. Usually reviewed within 24h.</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="bg-accent/40 rounded-xl p-3 mb-4 flex gap-2">
              <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80">Verified sellers earn a badge, gain buyer trust, and unlock higher posting limits.</p>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl mb-4">{error}</p>}

            <label className="text-sm font-medium">National ID / Passport Number</label>
            <input
              type="text" value={idNumber} onChange={e => setIdNumber(e.target.value)}
              placeholder="e.g. 12345678"
              className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none"
            />

            <label className="text-sm font-medium block mt-4">Selfie holding your ID</label>
            <input ref={fileRef} type="file" accept="image/*" capture="user" hidden onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {preview ? (
              <div className="relative mt-1">
                <img src={preview} alt="selfie" className="w-full aspect-square object-cover rounded-xl" />
                <button onClick={() => { setSelfie(null); setPreview(""); }} className="absolute top-2 right-2 p-1.5 bg-card/90 rounded-full"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} className="w-full mt-1 aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground active:scale-95 transition-transform">
                <Camera className="h-8 w-8" />
                <span className="text-sm">Take a selfie</span>
              </button>
            )}

            <button
              onClick={submit} disabled={submitting || !idNumber || !selfie}
              className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit for Review
            </button>
          </>
        )}
      </div>
    </div>
  );
}
