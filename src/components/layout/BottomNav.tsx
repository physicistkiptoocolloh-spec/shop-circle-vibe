import { Home, PlusCircle, MessageSquare, LayoutDashboard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUnreadMessageCount } from "@/hooks/useUnreadMessages";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/sell", icon: PlusCircle, label: "Sell" },
  { path: "/inbox", icon: MessageSquare, label: "Inbox" },
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const unread = useUnreadMessageCount();

  const hiddenPaths = ["/auth", "/chat/"];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          const showBadge = path === "/inbox" && unread > 0;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-all active:scale-95",
                isActive ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative">
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </span>
              <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
