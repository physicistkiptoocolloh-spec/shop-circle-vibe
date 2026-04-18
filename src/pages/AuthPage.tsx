import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Phone, Lock, ArrowRight, Loader2, ChevronDown, AlertTriangle, ShieldCheck, RefreshCw, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRIES, AVATAR_ICONS } from "@/lib/mockData";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useDeviceFingerprint } from "@/hooks/useDeviceFingerprint";
import { sendOtp, verifyOtp, type OtpChannel } from "@/lib/sms";
import { consumeReferralCode } from "@/lib/invite";

const phoneToEmail = (phone: string) => `${phone.replace(/\D/g, "")}@phone.sokomtaani.app`;

export default function AuthPage() {
  const navigate = useNavigate();
  const { refreshProfile, user } = useAuth();
  const { duplicateDetected } = useDeviceFingerprint(user?.id);
  const [showDupeModal, setShowDupeModal] = useState(false);
  const [step, setStep] = useState<"auth" | "otp" | "profile">("auth");
  const [isLogin, setIsLogin] = useState(false);
  const [channel, setChannel] = useState<OtpChannel>("whatsapp");
  // Strict format: digits only, e.g. 254712345678 (no '+')
  const [phone, setPhone] = useState("254");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [location, setLocation] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("User");

  useEffect(() => { if (duplicateDetected) setShowDupeModal(true); }, [duplicateDetected]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Strict: digits only, country code first (e.g. 254712345678)
  const normalizedPhone = phone.replace(/\D/g, "");
  const phoneValid = /^[1-9]\d{9,14}$/.test(normalizedPhone);

  const handleSignupStart = async () => {
    setLoading(true); setError("");
    try {
      if (!phoneValid) throw new Error("Enter phone in format: 254712345678 (country code + number, digits only)");
      if (password.length < 6) throw new Error("Password must be at least 6 characters");
      const res = await sendOtp(normalizedPhone, channel);
      setResendTimer(res.retryIn || 60);
      setStep("otp");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setError(""); setLoading(true);
    try {
      const res = await sendOtp(normalizedPhone, channel);
      setResendTimer(res.retryIn || 60);
    } catch (e: any) {
      setError(e.message);
      if (/wait/i.test(e.message)) setResendTimer(60);
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setLoading(true); setError("");
    try {
      await verifyOtp(normalizedPhone, otpCode.trim());
      const email = phoneToEmail(normalizedPhone);
      const referralCode = consumeReferralCode();
      const { error: signUpErr } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { phone: normalizedPhone, phone_verified: true, referral_code: referralCode },
        },
      });
      if (signUpErr && !/already registered/i.test(signUpErr.message)) throw signUpErr;
      const { error: siErr } = await supabase.auth.signInWithPassword({ email, password });
      if (siErr) throw new Error("Account created. Please sign in.");
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        // Resolve referral code -> user_id
        let referredBy: string | null = null;
        if (referralCode) {
          const { data: ref } = await supabase.from("profiles").select("user_id").eq("referral_code", referralCode).maybeSingle();
          referredBy = ref?.user_id ?? null;
        }
        await supabase.from("profiles").update({
          phone: normalizedPhone, phone_verified: true,
          ...(referredBy ? { referred_by: referredBy } : {}),
        }).eq("user_id", u.id);
      }
      await refreshProfile();
      setStep("profile");
    } catch (e: any) { setError(e.message || "Invalid code"); }
    finally { setLoading(false); }
  };

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      if (!phoneValid) throw new Error("Phone must be in format: 254712345678");
      const email = phoneToEmail(normalizedPhone);
      const { error: e } = await supabase.auth.signInWithPassword({ email, password });
      if (e) throw new Error("Invalid phone or password");
      await refreshProfile();
      navigate("/");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleProfileSetup = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await supabase.from("profiles").update({
        name, avatar_icon: selectedIcon, country, location, phone: normalizedPhone, phone_verified: true,
      }).eq("user_id", user.id);
      await refreshProfile();
      navigate("/");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (showDupeModal) {
    return (
      <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center px-6">
        <div className="bg-card rounded-2xl w-full max-w-sm p-6 animate-fade-in">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h3 className="font-bold text-center mt-3 text-lg">Account Already Exists</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Another account is already registered from this device. SokoMtaani allows only one account per device.
          </p>
          <button onClick={() => setShowDupeModal(false)} className="w-full mt-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold active:scale-95 transition-transform">I Understand</button>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
        {channel === "whatsapp" ? <MessageCircle className="h-16 w-16 text-primary mb-3" /> : <ShieldCheck className="h-16 w-16 text-primary mb-3" />}
        <h1 className="text-xl font-bold">Verify your phone</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">We sent a 6-digit code via <strong>{channel === "whatsapp" ? "WhatsApp" : "SMS"}</strong> to <strong>+{normalizedPhone}</strong></p>

        {error && <p className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-xl w-full max-w-sm">{error}</p>}

        <div className="w-full max-w-sm mt-6">
          <input
            type="text" inputMode="numeric" maxLength={6}
            value={otpCode}
            onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full bg-muted rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold outline-none focus:ring-2 ring-primary/30"
          />
          <button onClick={handleVerifyOtp} disabled={loading || otpCode.length !== 6} className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Verify <ArrowRight className="h-4 w-4" />
          </button>

          <div className="mt-4 text-center text-sm">
            {resendTimer > 0 ? (
              <p className="text-muted-foreground">Resend code in <span className="font-semibold text-foreground">{resendTimer}s</span></p>
            ) : (
              <button onClick={handleResend} disabled={loading} className="text-primary font-medium flex items-center gap-1.5 mx-auto active:scale-95 transition-transform">
                <RefreshCw className="h-3.5 w-3.5" /> Resend code
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">Didn't receive? Check {channel === "whatsapp" ? "your WhatsApp chats" : "your SMS spam folder"}.</p>
          <button onClick={() => setStep("auth")} className="w-full mt-4 text-xs text-muted-foreground active:scale-95 transition-transform">← Change phone number</button>
        </div>
      </div>
    );
  }

  if (step === "profile") {
    return (
      <div className="min-h-screen px-6 py-8 animate-fade-in">
        <h1 className="text-xl font-bold">Set up your profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Let buyers know who you are</p>

        <div className="mt-6 flex flex-col items-center">
          <UserAvatar icon={selectedIcon} size="xl" />
          <p className="text-xs text-muted-foreground mt-2">Choose an avatar icon</p>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            {AVATAR_ICONS.map(icon => (
              <button key={icon} onClick={() => setSelectedIcon(icon)} className={`p-2 rounded-xl border-2 active:scale-95 transition-transform ${selectedIcon === icon ? "border-primary bg-accent" : "border-border"}`}>
                <UserAvatar icon={icon} size="sm" />
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl mt-4">{error}</p>}

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium">Country</label>
            <div className="relative mt-1">
              <select value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm outline-none appearance-none">
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City or area" className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none" />
          </div>
        </div>

        <button onClick={handleProfileSetup} disabled={loading || !name} className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Complete Setup <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ── AUTH ──
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 animate-fade-in">
      <Store className="h-12 w-12 text-primary mb-2" />
      <h1 className="text-2xl font-bold text-primary">SokoMtaani</h1>
      <p className="text-sm text-muted-foreground mt-1">{isLogin ? "Welcome back!" : "Create your account"}</p>

      <div className="w-full max-w-sm mt-8 space-y-4">
        {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">{error}</p>}

        <div>
          <label className="text-sm font-medium">Phone Number</label>
          <div className="flex items-center bg-muted rounded-xl px-4 py-2.5 mt-1 gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <input
              type="tel" inputMode="numeric"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="254712345678"
              className="bg-transparent text-sm outline-none w-full"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Format: country code + number, digits only (e.g. 254712345678)</p>
        </div>

        {!isLogin && (
          <div>
            <label className="text-sm font-medium">Verification method</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={`py-2.5 rounded-xl text-sm font-medium border-2 flex items-center justify-center gap-1.5 active:scale-95 transition-all ${channel === "whatsapp" ? "border-primary bg-accent text-foreground" : "border-border text-muted-foreground"}`}
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setChannel("sms")}
                className={`py-2.5 rounded-xl text-sm font-medium border-2 flex items-center justify-center gap-1.5 active:scale-95 transition-all ${channel === "sms" ? "border-primary bg-accent text-foreground" : "border-border text-muted-foreground"}`}
              >
                <Phone className="h-4 w-4" /> SMS
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Password</label>
          <div className="flex items-center bg-muted rounded-xl px-4 py-2.5 mt-1 gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="bg-transparent text-sm outline-none w-full" />
          </div>
        </div>

        <button onClick={isLogin ? handleLogin : handleSignupStart} disabled={loading || !phone || !password} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isLogin ? "Sign In" : `Send code via ${channel === "whatsapp" ? "WhatsApp" : "SMS"}`}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-primary font-medium active:scale-95 transition-transform">{isLogin ? "Sign Up" : "Sign In"}</button>
        </p>
      </div>
    </div>
  );
}
