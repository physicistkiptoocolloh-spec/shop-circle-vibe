import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Share2, Users, Gift, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { inviteUrl, shareLink } from "@/lib/invite";

export default function InviteFriendsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);

  const url = inviteUrl(profile?.referral_code);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => shareLink({
    title: "Join SokoMtaani",
    text: "Buy & sell in your neighbourhood — join me on SokoMtaani!",
    url,
  });

  return (
    <div className="animate-fade-in pb-4">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 active:scale-95"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Invite Friends</h1>
      </div>

      <div className="px-4">
        <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-2xl p-6 text-center">
          <Gift className="h-10 w-10 mx-auto" />
          <h2 className="font-bold text-xl mt-2">Grow your community</h2>
          <p className="text-sm opacity-90 mt-1">Share SokoMtaani with friends and family.</p>
        </div>

        <div className="mt-5 flex items-center gap-2 px-3 py-3 bg-muted rounded-xl">
          <span className="text-sm flex-1 truncate font-mono">{url}</span>
          <button onClick={handleCopy} className="p-2 rounded-lg bg-card active:scale-95 transition-transform">
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <button onClick={handleShare} className="w-full mt-3 bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Share2 className="h-4 w-4" /> Share Invite Link
        </button>

        <div className="mt-6 p-4 bg-card border border-border rounded-xl flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">{profile?.referral_count ?? 0}</p>
            <p className="text-xs text-muted-foreground">Friends joined via your link</p>
          </div>
        </div>
      </div>
    </div>
  );
}
