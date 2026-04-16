import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatar?: string | null;
  icon?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const iconSizeMap = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
};

export function UserAvatar({ avatar, icon, name, size = "md", className, onClick }: UserAvatarProps) {
  // Always resolve to a valid icon, fallback to User
  const iconName = icon && icon.trim() && (Icons as any)[icon] ? icon : "User";
  const IconComponent = (Icons as any)[iconName];

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name || "User"}
        onClick={onClick}
        className={cn("rounded-full object-cover cursor-pointer", sizeMap[size], className)}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-full bg-primary/10 flex items-center justify-center cursor-pointer",
        sizeMap[size],
        className
      )}
    >
      <IconComponent size={iconSizeMap[size]} className="text-primary" />
    </div>
  );
}
