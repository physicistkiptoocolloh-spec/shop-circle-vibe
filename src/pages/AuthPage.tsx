import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Mail, Lock, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRIES, AVATAR_ICONS } from "@/lib/mockData";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState<"auth" | "verify" | "profile">("auth");
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Profile setup
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("User");

  const handleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await refreshProfile();
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setStep("verify");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSetup = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("profiles").update({
        name,
        avatar_icon: selectedIcon,
        country,
        location,
        phone,
      }).eq("user_id", user.id);

      await refreshProfile();
      navigate("/");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
        <Mail className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-xl font-bold">Check your email</h1>
        <p className="text-sm text-muted-foreground text-center mt-2">We sent a verification link to <strong>{email}</strong>. Click it to continue.</p>
        <button onClick={() => setStep("profile")} className="mt-6 text-sm text-primary font-medium">I've verified → Set up profile</button>
      </div>
    );
  }

  if (step === "profile") {
    return (
      <div className="min-h-screen px-6 py-8 animate-fade-in">
        <h1 className="text-xl font-bold">Set up your profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Let buyers and sellers know who you are</p>

        <div className="mt-6 flex flex-col items-center">
          <UserAvatar icon={selectedIcon} size="xl" />
          <p className="text-xs text-muted-foreground mt-2">Choose an avatar icon</p>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            {AVATAR_ICONS.map(icon => (
              <button key={icon} onClick={() => setSelectedIcon(icon)} className={`p-2 rounded-xl border-2 ${selectedIcon === icon ? "border-primary bg-accent" : "border-border"}`}>
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
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254..." className="w-full mt-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none" />
          </div>
        </div>

        <button onClick={handleProfileSetup} disabled={loading || !name} className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Complete Setup <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 animate-fade-in">
      <Store className="h-12 w-12 text-primary mb-2" />
      <h1 className="text-2xl font-bold text-primary">SokoMtaani</h1>
      <p className="text-sm text-muted-foreground mt-1">{isLogin ? "Welcome back!" : "Create your account"}</p>

      <div className="w-full max-w-sm mt-8 space-y-4">
        {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">{error}</p>}

        <div>
          <label className="text-sm font-medium">Email</label>
          <div className="flex items-center bg-muted rounded-xl px-4 py-2.5 mt-1 gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="bg-transparent text-sm outline-none w-full" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Password</label>
          <div className="flex items-center bg-muted rounded-xl px-4 py-2.5 mt-1 gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-transparent text-sm outline-none w-full" />
          </div>
        </div>

        <button onClick={handleAuth} disabled={loading || !email || !password} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isLogin ? "Sign In" : "Sign Up"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-primary font-medium">{isLogin ? "Sign Up" : "Sign In"}</button>
        </p>
      </div>
    </div>
  );
}
