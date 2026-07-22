"use client";

import { KeyRound, Laptop, ShieldAlert } from "lucide-react";
import type { HelpCategory, SupportTicket } from "@/types";
import AppCard from "@/components/ui/AppCard";
import AppButton from "@/components/ui/AppButton";
import MyRequests from "./MyRequests";

const SERVICE_CATEGORY_ICONS = { "account-login": KeyRound, "technical-problems": Laptop };

/**
 * "Support Tickets" tab — the Service Desk surface. Deliberately not a
 * relabeled copy of the Helpdesk tab (gap-closure #5): it leads with
 * account/access/MFA/technical framing, and its main job is full ticket
 * lifecycle visibility (status, last updated, assigned owner, status
 * history, resolution) across every request the student has raised,
 * across both desks (gap-closure #2/#3).
 */
export default function ServiceDeskView({
  tickets,
  categories,
  onOpenTicket,
  onCancel,
  onConsentClose,
  busyId,
}: {
  tickets: SupportTicket[];
  categories: HelpCategory[];
  onOpenTicket: (categoryId: string) => void;
  onCancel: (id: string) => void;
  onConsentClose: (id: string) => void;
  busyId: string | null;
}) {
  const serviceCategories = categories.filter((c) => c.desk === "service");

  return (
    <div className="flex flex-col gap-8">
      <AppCard variant="ocean" padding="lg" className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-white">
          <ShieldAlert size={20} className="shrink-0" />
          <h1 className="font-display text-xl font-extrabold">Account & Technical Support</h1>
        </div>
        <p className="max-w-2xl text-[13.5px] leading-relaxed text-white/80">
          Login problems, MFA, account access, and platform faults are
          handled here by the Service Desk team — separate from Help Desk
          learning questions, so the right people see the right requests.
        </p>
        <div className="flex flex-wrap gap-3">
          {serviceCategories.map((c) => {
            const Icon = SERVICE_CATEGORY_ICONS[c.id as keyof typeof SERVICE_CATEGORY_ICONS];
            return (
              <button
                key={c.id}
                onClick={() => onOpenTicket(c.id)}
                className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/25"
              >
                {Icon && <Icon size={15} />}
                {c.label}
              </button>
            );
          })}
        </div>
        <AppButton
          variant="dark"
          className="self-start bg-white text-cha-ocean hover:bg-white/90"
          onPress={() => onOpenTicket(serviceCategories[0]?.id ?? "account-login")}
        >
          Open a Service Desk Request
        </AppButton>
      </AppCard>

      <div>
        <h2 className="mb-4 font-display text-lg font-bold">My Requests</h2>
        <MyRequests
          tickets={tickets}
          categories={categories}
          variant="full"
          onCancel={onCancel}
          onConsentClose={onConsentClose}
          busyId={busyId}
        />
      </div>
    </div>
  );
}
