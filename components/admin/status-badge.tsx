import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PACKED: "bg-violet-100 text-violet-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED: "bg-stone-200 text-stone-700",
  PAID: "bg-emerald-100 text-emerald-800",
  REFUNDED: "bg-stone-200 text-stone-700",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  DRAFT: "bg-stone-200 text-stone-700",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <Badge
      className={cn(
        "border-transparent font-medium",
        STYLES[value] ?? "bg-stone-100 text-stone-700",
      )}
    >
      {value}
    </Badge>
  );
}
