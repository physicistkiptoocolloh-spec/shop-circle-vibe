import { AlertTriangle } from "lucide-react";

export function DangerSellerBanner() {
  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-destructive">Warning: This seller has been reported multiple times</p>
        <p className="text-xs text-muted-foreground mt-1">Exercise caution when dealing with this seller. Multiple buyers have reported issues.</p>
      </div>
    </div>
  );
}
