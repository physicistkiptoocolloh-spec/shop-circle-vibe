import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, Shield, FileText, AlertTriangle, Bell, LogOut,
  ChevronRight, Store, CreditCard, HelpCircle, Lock, Eye, UserCheck, Gift
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut, isAuthenticated } = useAuth();

  const sections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Edit Profile", path: "/profile/edit" },
        { icon: Bell, label: "Notifications", path: "/notifications" },
        { icon: Eye, label: "Privacy Settings", path: "/privacy-settings" },
      ],
    },
    {
      title: "Selling",
      items: [
        { icon: Store, label: "Start Selling", description: "List your first product!", path: "/sell" },
        { icon: CreditCard, label: "Payment Settings", path: "/dashboard" },
        { icon: Shield, label: "Verification", path: "/dashboard" },
      ],
    },
    {
      title: "Legal & Safety",
      items: [
        { icon: FileText, label: "Terms of Service", path: "/tos" },
        { icon: FileText, label: "Buyer Guidelines", path: "/tos?tab=buyer" },
        { icon: FileText, label: "Seller Guidelines", path: "/tos?tab=seller" },
        { icon: AlertTriangle, label: "Community Standards", path: "/tos?tab=community" },
        { icon: Shield, label: "Safety Tips", path: "/tos?tab=safety" },
        { icon: FileText, label: "Privacy Policy", path: "/tos?tab=privacy" },
        { icon: AlertTriangle, label: "Report a Problem", path: "/report" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", path: "/help" },
        { icon: FileText, label: "FAQ", path: "/help" },
      ],
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="animate-fade-in pb-4">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Settings</h1>
      </div>

      {!isAuthenticated && (
        <div className="mx-4 mb-4 p-4 bg-accent rounded-xl text-center">
          <p className="text-sm text-muted-foreground mb-2">Sign in to access all settings</p>
          <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-semibold">Sign In</button>
        </div>
      )}

      {sections.map(section => (
        <div key={section.title} className="mb-4">
          <h2 className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">{section.title}</h2>
          <div className="mx-4 bg-card rounded-xl border border-border overflow-hidden">
            {section.items.map((item, i) => (
              <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left ${i > 0 ? "border-t border-border" : ""}`}>
                <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1"><p className="text-sm font-medium">{item.label}</p>{item.description && <p className="text-[11px] text-muted-foreground">{item.description}</p>}</div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {isAuthenticated && (
        <div className="px-4 mt-4">
          <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-3 bg-destructive/10 text-destructive rounded-xl font-semibold text-sm">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      )}

      <p className="text-center text-[10px] text-muted-foreground mt-4">SokoMtaani v1.0.0</p>
    </div>
  );
}
