import { ShieldCheck, ShieldPlus, Award, Crown, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { VERIFICATION_TIERS } from "@/lib/mockData";

const badgeIcons: Record<string, any> = { ShieldCheck, ShieldPlus, Award, Crown, Gem };

interface VerificationBadgeProps {
  tier: number;
  size?: number;
  className?: string;
}

export function VerificationBadge({ tier, size = 16, className }: VerificationBadgeProps) {
  if (tier <= 0) return null;
  const tierData = VERIFICATION_TIERS[tier - 1];
  if (!tierData) return null;
  const Icon = badgeIcons[tierData.badgeIcon] || ShieldCheck;

  return (
    <Icon
      size={size}
      className={cn("inline-block flex-shrink-0", className)}
      style={{ color: tierData.color }}
    />
  );
}
