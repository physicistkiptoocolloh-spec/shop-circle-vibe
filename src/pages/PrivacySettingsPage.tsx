import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, MapPin, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function PrivacySettingsPage() {
  const navigate = useNavigate();
  const { profile, user, refreshProfile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showPhone, setShowPhone] = useState(true);
  const [showLocation, setShowLocation] = useState(true);

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
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
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
            <Toggle value={showPhone} onChange={setShowPhone} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Show Location</p>
                <p className="text-[11px] text-muted-foreground">Visible on your products and profile</p>
              </div>
            </div>
            <Toggle value={showLocation} onChange={setShowLocation} />
          </div>
        </div>

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
