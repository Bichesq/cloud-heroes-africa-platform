import { CheckCircle2, Circle, Clock, MessageCircle, XCircle, type LucideIcon } from "lucide-react";
import type { TicketStatus } from "@/types";

/* Status is never conveyed by color alone — icon + text label together,
 * per help.md's accessibility requirement and the decision log's status
 * semantics (Open=active, Pending=waiting, Responded=answered,
 * Resolved=resolved, Cancelled=non-actionable). */
const STATUS_META: Record<
  TicketStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  open: { label: "Open", icon: Circle, className: "bg-cha-blue/10 text-cha-blue" },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-cha-warning/15 text-amber-600 dark:text-cha-warning",
  },
  responded: {
    label: "Responded",
    icon: MessageCircle,
    className: "bg-cha-ocean/15 text-cha-ocean",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    className: "bg-cha-success/15 text-emerald-600 dark:text-cha-success",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-cha-surface-2 text-cha-faint",
  },
};

export default function StatusChip({ status }: { status: TicketStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${meta.className}`}
    >
      <Icon size={13} className="shrink-0" />
      {meta.label}
    </span>
  );
}
