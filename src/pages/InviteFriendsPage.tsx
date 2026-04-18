import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Share2, Users, Gift, Check, Rocket, Loader2, MessageCircle, Facebook, Twitter, Send, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { inviteUrl, shareLink, socialShareUrls } from "@/lib/invite";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function InviteFriendsPage() {
  const navigate = useNavigate();
  const { profile, refreshProfile, user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const url = inviteUrl(profile?.referral_code);
  const shareText = "Buy & sell in your neighbourhood — join me on SokoMtaani!";
  const refCount = profile?.referral_count ?? 0;
  const claimed = (profile as any)?.referral_rewards_claimed ?? 0;
  const milestonesEarned = Math.floor(refCount / 10);
  const unclaimedMilestones = milestonesEarned - claimed;
  const nextMilestoneAt = (milestonesEarned + 1) * 10;
  const progress = Math.min(100, ((refCount % 10) / 10) * 100);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => shareLink({ title: "Join SokoMtaani", text: shareText, url });

  const handleClaim = async () => {
    if (!user) return;
    setClaiming(true);
    try {
      const { data, error } = await supabase.rpc("claim_referral_boost_reward", { _user_id: user.id });
      if (error) throw error;
      const result = data as any;
      if (result?.success) {
        toast({ title: "Reward unlocked!", description: `${result.days_granted} days of free Boost added to your account.` });
        await refreshProfile();
      } else {
        toast({ title: "No rewards", description: result?.error || "Nothing to claim yet.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setClaiming(false);
    }
  };

  const social = socialShareUrls(shareText, url);
  const socials = [
    { name: "WhatsApp", icon: MessageCircle, url: social.whatsapp, color: "text-[#25D366]" },
    { name: "Facebook", icon: Facebook, url: social.facebook, color: "text-[#1877F2]" },
    { name: "X / Twitter", icon: Twitter, url: social.twitter, color: "text-foreground" },
    { name: "Telegram", icon: Send, url: social.telegram, color: "text-[#229ED9]" },
    { name: "Email", icon: Mail, url: social.email, color: "text-muted-foreground" },
  ];

  return (
    <div className="animate-fade-in pb-8">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 active:scale-95"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Invite Friends</h1>
      </div>

      <div className="px-4">
        <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-2xl p-6 text-center">
          <Gift className="h-10 w-10 mx-auto" />
          <h2 className="font-bold text-xl mt-2">Earn 2 free Boost days</h2>
          <p className="text-sm opacity-90 mt-1">Every 10 friends who sign up = 2 days of free product Boost.</p>
        </div>

        {/* Progress card */}
        <div className="mt-4 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> {refCount} referrals</span>
            <span className="text-xs text-muted-foreground">Next reward: {nextMilestoneAt}</span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          {unclaimedMilestones > 0 ? (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full mt-3 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Claim {unclaimedMilestones * 2} free Boost days
            </button>
          ) : (
            <p className="mt-2 text-[11px] text-muted-foreground">Invite {10 - (refCount % 10)} more to unlock the next 2-day boost.</p>
          )}
        </div>

        {/* Link box */}
        <div className="mt-4 flex items-center gap-2 px-3 py-3 bg-muted rounded-xl">
          <span className="text-sm flex-1 truncate font-mono">{url}</span>
          <button onClick={handleCopy} className="p-2 rounded-lg bg-card active:scale-95 transition-transform">
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <button onClick={handleShare} className="w-full mt-3 bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Share2 className="h-4 w-4" /> Share Invite Link
        </button>

        {/* Social media buttons */}
        <div className="mt-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Share to social media</p>
          <div className="grid grid-cols-5 gap-2">
            {socials.map(s => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 p-3 bg-card border border-border rounded-xl hover:bg-accent active:scale-95 transition-all"
                aria-label={`Share on ${s.name}`}
              >
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <span className="text-[10px] text-muted-foreground">{s.name.split(" ")[0]}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-card border border-border rounded-xl flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">{refCount}</p>
            <p className="text-xs text-muted-foreground">Friends joined via your link</p>
          </div>
        </div>
      </div>
    </div>
  );
}
