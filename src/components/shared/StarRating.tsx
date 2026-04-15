import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}

export function StarRating({ rating, size = 16, interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          className={cn(!interactive && "cursor-default")}
        >
          <Star
            size={size}
            className={cn(
              i <= rating ? "fill-warning text-warning" : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}
