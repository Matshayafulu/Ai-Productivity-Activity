import { AVAILABILITY_LABEL, type Availability } from "@/lib/app-store";
import { cn } from "@/lib/utils";

const DOT: Record<Availability, string> = {
  available: "bg-success",
  away: "bg-warning",
  busy: "bg-destructive",
};

export function AvailabilityBadge({
  status,
  className,
  showLabel = true,
}: {
  status: Availability;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span
        aria-hidden="true"
        className={cn("inline-block size-2.5 rounded-full", DOT[status])}
      />
      <span className="sr-only">Availability: </span>
      {showLabel && AVAILABILITY_LABEL[status]}
    </span>
  );
}
