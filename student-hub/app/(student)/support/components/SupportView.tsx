"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupportTicket, TicketContext } from "@/types";
import { HELP_CATEGORIES, FAQS } from "@/lib/help-catalog";
import { searchFaqs, filterByCategory } from "@/lib/help-search";
import HelpBanner from "@/components/support/HelpBanner";
import CategoryGrid from "@/components/support/CategoryGrid";
import CommonQuestions from "@/components/support/CommonQuestions";
import SearchResults from "@/components/support/SearchResults";
import NeedMoreHelp from "@/components/support/NeedMoreHelp";
import MyRequests, { OPEN_STATUSES } from "@/components/support/MyRequests";
import OpenTicketModal, { type TicketDraft } from "@/components/support/OpenTicketModal";

const HELP_DESK_CATEGORIES = HELP_CATEGORIES.filter((c) => c.desk === "help");

/**
 * Help Desk landing (/support) — signed-in students only, per the product
 * decision that Help Desk (learning/content/community) is a feature for
 * students actively taking courses. Service Desk (account/access/technical)
 * now lives at its own route, /service-desk, reachable both signed-in and
 * before sign-in — so this view never creates Service Desk tickets itself.
 *
 * The full category grid (all 6 topics) still renders here for orientation,
 * matching the Help View mockups, but selecting a Service Desk topic hands
 * off to /service-desk instead of opening a Help Desk request.
 */
export default function SupportView({
  initialTickets,
  context,
}: {
  initialTickets: SupportTicket[];
  context: TicketContext;
}) {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState(initialTickets);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyTicketId, setBusyTicketId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => HELP_CATEGORIES.find((c) => c.id === selectedCategoryId) ?? null,
    [selectedCategoryId]
  );
  const categoryFaqs = useMemo(
    () => filterByCategory(selectedCategoryId, FAQS),
    [selectedCategoryId]
  );
  const searchResults = useMemo(() => searchFaqs(query, FAQS), [query]);
  const existingTicketForCategory = useMemo(
    () =>
      selectedCategoryId
        ? tickets.find(
            (t) => t.categoryId === selectedCategoryId && OPEN_STATUSES.has(t.status)
          ) ?? null
        : null,
    [tickets, selectedCategoryId]
  );

  function selectCategory(id: string) {
    const category = HELP_CATEGORIES.find((c) => c.id === id);
    if (category?.desk === "service") {
      router.push(`/service-desk?category=${id}`);
      return;
    }
    setSelectedCategoryId((prev) => (prev === id ? null : id));
    setQuery("");
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

  const searching = query.trim().length > 0;

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
          onOpenTicket={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-6">
            <CategoryGrid
              categories={HELP_CATEGORIES}
              selectedId={selectedCategoryId}
              onSelect={selectCategory}
            />
            <NeedMoreHelp
              ctaLabel="Open a Help Desk Request"
              onOpenTicket={() => setModalOpen(true)}
              existingTicket={existingTicketForCategory}
              onViewExisting={() => {
                document.getElementById("my-help-desk-requests")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            />
          </div>
          <CommonQuestions
            faqs={categoryFaqs}
            allFaqs={FAQS}
            categoryLabel={selectedCategory?.label}
          />
        </div>
      )}

      <div id="my-help-desk-requests">
        <h2 className="mb-4 font-display text-lg font-bold">My Help Desk Requests</h2>
        <MyRequests
          tickets={tickets}
          categories={HELP_CATEGORIES}
          variant="full"
          onCancel={(id) => patchTicket(id, "cancel")}
          onConsentClose={(id) => patchTicket(id, "consent-close")}
          busyId={busyTicketId}
        />
      </div>

      <OpenTicketModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        categories={HELP_DESK_CATEGORIES}
        initialCategoryId={selectedCategoryId}
        context={context}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}
