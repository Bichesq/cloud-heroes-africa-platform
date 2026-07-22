"use client";

import { useMemo, useState } from "react";
import type { SupportTicket, TicketContext } from "@/types";
import { HELP_CATEGORIES, FAQS } from "@/lib/help-catalog";
import { searchFaqs } from "@/lib/help-search";
import HelpBanner from "@/components/support/HelpBanner";
import SearchResults from "@/components/support/SearchResults";
import ServiceDeskView from "@/components/support/ServiceDeskView";
import OpenTicketModal, { type TicketDraft } from "@/components/support/OpenTicketModal";

const SERVICE_DESK_CATEGORIES = HELP_CATEGORIES.filter((c) => c.desk === "service");
const SERVICE_FAQS = FAQS.filter((f) =>
  SERVICE_DESK_CATEGORIES.some((c) => c.id === f.categoryId)
);

/**
 * Authenticated /service-desk shell — signed-in students get the same
 * search-first self-service surface as Help Desk, plus the full Service
 * Desk ticket-lifecycle view (ServiceDeskView). Distinct from the anonymous
 * PublicServiceDeskForm: here identity comes from the session, so tickets
 * are tracked in "My Requests" like any other authenticated request.
 */
export default function ServiceDeskPageClient({
  initialTickets,
  context,
  initialCategoryId,
}: {
  initialTickets: SupportTicket[];
  context: TicketContext;
  initialCategoryId: string | null;
}) {
  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState(initialTickets);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategoryId, setModalCategoryId] = useState<string | null>(initialCategoryId);
  const [busyTicketId, setBusyTicketId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const searchResults = useMemo(() => searchFaqs(query, SERVICE_FAQS), [query]);
  const searching = query.trim().length > 0;

  function openModal(categoryId: string) {
    setModalCategoryId(categoryId);
    setModalOpen(true);
  }

  async function handleCreateTicket(
    draft: TicketDraft
  ): Promise<{ ok: boolean; message?: string }> {
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ticket) {
        return { ok: false, message: json?.error ?? "Couldn't submit your request." };
      }
      setTickets((prev) => [json.ticket, ...prev]);
      return { ok: true };
    } catch {
      return { ok: false, message: "Couldn't submit your request. Please try again." };
    }
  }

  async function patchTicket(id: string, action: "cancel" | "consent-close") {
    setBusyTicketId(id);
    setActionError(null);
    try {
      const res = await fetch("/api/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ticket) throw new Error();
      setTickets((prev) => prev.map((t) => (t.id === id ? json.ticket : t)));
    } catch {
      setActionError("Couldn't update that request. Please try again.");
    } finally {
      setBusyTicketId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <HelpBanner query={query} onQueryChange={setQuery} />

      {actionError && (
        <p role="alert" className="text-[12.5px] font-medium text-red-500">
          {actionError}
        </p>
      )}

      {searching ? (
        <SearchResults
          query={query}
          results={searchResults}
          onClearSearch={() => setQuery("")}
          onOpenTicket={() => openModal(SERVICE_DESK_CATEGORIES[0]?.id ?? "account-login")}
        />
      ) : (
        <ServiceDeskView
          tickets={tickets}
          categories={HELP_CATEGORIES}
          onOpenTicket={openModal}
          onCancel={(id) => patchTicket(id, "cancel")}
          onConsentClose={(id) => patchTicket(id, "consent-close")}
          busyId={busyTicketId}
        />
      )}

      <OpenTicketModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        categories={SERVICE_DESK_CATEGORIES}
        initialCategoryId={modalCategoryId}
        context={context}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}
