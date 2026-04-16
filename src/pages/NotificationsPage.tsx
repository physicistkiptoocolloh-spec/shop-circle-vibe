import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <p className="text-sm text-muted-foreground">Sign in to see notifications.</p>
        <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm">Sign In</button>
      </div>
    );
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="animate-fade-in pb-4">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg flex-1">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={() => markAllRead.mutate()} className="text-xs text-primary font-medium flex items-center gap-1">
            <Check className="h-3 w-3" /> Mark all read
          </button>
        )}
      </div>

      {isLoading && <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}

      <div className="px-4 space-y-2">
        {notifications?.map(n => (
          <button
            key={n.id}
            onClick={() => !n.read && markRead.mutate(n.id)}
            className={`w-full text-left p-4 rounded-xl border transition-colors ${n.read ? "bg-card border-border" : "bg-primary/5 border-primary/20"}`}
          >
            <div className="flex items-start gap-3">
              <Bell className={`h-5 w-5 mt-0.5 flex-shrink-0 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!n.read ? "text-primary" : ""}`}>{n.title}</p>
                {n.message && <p className="text-xs text-muted-foreground mt-1">{n.message}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
            </div>
          </button>
        ))}
        {!isLoading && notifications?.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">No notifications yet</p>
        )}
      </div>
    </div>
  );
}
