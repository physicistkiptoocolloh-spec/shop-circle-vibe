import { Bell, Store, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "@/components/shared/UserAvatar";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-primary tracking-tight">SokoMtaani</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/search")}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate("/notifications")}
            className="p-2 rounded-full hover:bg-accent transition-colors relative"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
          <button
            onClick={() => navigate("/profile/me")}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
          >
            <UserAvatar icon="User" size="sm" />
          </button>
        </div>
      </div>
    </header>
  );
}
