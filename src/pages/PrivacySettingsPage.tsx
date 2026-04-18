import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "sokomtaani.privacy_settings";

export default function PrivacySettingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showPhone, setShowPhone] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        setShowPhone(v.showPhone ?? true);
        setShowLocation(v.showLocation ?? true);
      }
    } catch { /* ignore */ }
  }, []);

  const update = (patch: { showPhone?: boolean; showLocation?: boolean }) => {
    if (patch.showPhone !== undefined) setShowPhone(patch.showPhone);
    if (patch.showLocation !== undefined) setShowLocation(patch.showLocation);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ showPhone, showLocation }));
      await new Promise(r => setTimeout(r, 300));
      toast({ title: "Privacy settings saved" });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <p className="text-sm text-muted-foreground">Sign in to manage privacy settings.</p>
        <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm">Sign In</button>
      </div>
    );
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}>
      <div className={`w-5 h-5 bg-card rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );

  return (
    <div className="animate-fade-in pb-8">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 active:scale-95"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Privacy Settings</h1>
      </div>

      <div className="px-4 space-y-4 mt-2">
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Profile Visibility</h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Show Phone Number</p>
                <p className="text-[11px] text-muted-foreground">Visible on your profile to other users</p>
              </div>
            </div>
            <Toggle value={showPhone} onChange={(v) => update({ showPhone: v })} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Show Location</p>
                <p className="text-[11px] text-muted-foreground">Visible on your products and profile</p>
              </div>
            </div>
            <Toggle value={showLocation} onChange={(v) => update({ showLocation: v })} />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : dirty ? "Save Changes" : "Saved"}
        </button>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Data & Security</h2>
          <p className="text-xs text-muted-foreground">
            Your data is stored securely and encrypted. We never share your personal information with third parties without consent. 
            For account deletion requests, contact admin through your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
