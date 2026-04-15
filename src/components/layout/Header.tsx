import { Bell, Store, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/shared/UserAvatar";

export default function Header() {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-primary tracking-tight">SokoMtaani</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/notifications")} className="p-2 rounded-full hover:bg-accent transition-colors relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>
          {isAuthenticated ? (
            <button onClick={() => navigate("/profile/edit")} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              <UserAvatar icon={profile?.avatar_icon || "User"} avatar={profile?.avatar_url} size="sm" />
            </button>
          ) : (
            <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold">Sign In</button>
          )}
        </div>
      </div>
    </header>
  );
}
