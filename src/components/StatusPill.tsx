import { SessionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusPill({ status }: { status: SessionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        status === SessionStatus.PENDING && "bg-yellow-100 text-yellow-800",
        status === SessionStatus.ACCEPTED && "bg-green-100 text-green-800",
        status === SessionStatus.COMPLETED && "bg-blue-100 text-blue-800"
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
