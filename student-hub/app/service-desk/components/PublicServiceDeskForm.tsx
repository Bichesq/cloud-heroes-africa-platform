"use client";

import { useMemo, useState } from "react";
import { Input, TextArea, TextField } from "@heroui/react";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { HELP_CATEGORIES, FAQS } from "@/lib/help-catalog";
import { searchFaqs } from "@/lib/help-search";
import HelpBanner from "@/components/support/HelpBanner";
import SearchResults from "@/components/support/SearchResults";
import CategoryGrid from "@/components/support/CategoryGrid";
import AppCard from "@/components/ui/AppCard";
import AppButton from "@/components/ui/AppButton";

const SERVICE_CATEGORIES = HELP_CATEGORIES.filter((c) => c.desk === "service");
const SERVICE_FAQS = FAQS.filter((f) => SERVICE_CATEGORIES.some((c) => c.id === f.categoryId));

/**
 * Anonymous Service Desk intake — reachable before sign-in for students
 * locked out of their account. Same search-first self-service principle as
 * the signed-in pages, then a lightweight name + email form since there's
 * no session to derive identity from. Fire-and-forget: staff follow up by
 * email, and the request is never tied back to an account later.
 */
export default function PublicServiceDeskForm({
  initialCategoryId,
}: {
  initialCategoryId: string | null;
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState(
    initialCategoryId && SERVICE_CATEGORIES.some((c) => c.id === initialCategoryId)
      ? initialCategoryId
      : SERVICE_CATEGORIES[0]?.id ?? ""
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [preferredChannel, setPreferredChannel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const searchResults = useMemo(() => searchFaqs(query, SERVICE_FAQS), [query]);
  const searching = query.trim().length > 0;

  async function handleSubmit() {
    if (!categoryId || !name.trim() || !email.trim() || !topic.trim() || !description.trim()) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          topic: topic.trim(),
          description: description.trim(),
          preferredChannel: preferredChannel.trim() || null,
          contactName: name.trim(),
          contactEmail: email.trim(),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ticket) {
        setError(json?.error ?? "Couldn't submit your request. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Couldn't submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-start gap-3 py-16">
        <CheckCircle2 size={32} className="text-cha-success" />
        <h1 className="font-display text-2xl font-extrabold">Request received</h1>
        <p className="max-w-md text-sm leading-relaxed text-cha-muted">
          Thanks, {name.trim() || "there"} — we&apos;ve received your request and
          will follow up at <strong>{email.trim()}</strong>. There&apos;s no need
          to submit this again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex items-center gap-2 text-cha-ink">
        <ShieldAlert size={22} className="shrink-0 text-cha-ocean" />
        <h1 className="font-display text-2xl font-extrabold">Account & Technical Support</h1>
      </div>
      <p className="max-w-xl text-sm leading-relaxed text-cha-muted">
        Locked out, having trouble with MFA, or hitting a technical problem?
        Search for an existing answer below, or send us the details and
        we&apos;ll follow up by email — no sign-in required.
      </p>

      <HelpBanner query={query} onQueryChange={setQuery} />

      {searching ? (
        <SearchResults
          query={query}
          results={searchResults}
          onClearSearch={() => setQuery("")}
          onOpenTicket={() =>
            document.getElementById("service-desk-form")?.scrollIntoView({ behavior: "smooth" })
          }
        />
      ) : (
        <CategoryGrid
          categories={SERVICE_CATEGORIES}
          selectedId={categoryId}
          onSelect={setCategoryId}
        />
      )}

      <AppCard id="service-desk-form" padding="lg" className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold">Still need help? Send us the details</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="contact-name" aria-label="Your name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl"
            />
          </TextField>
          <TextField name="contact-email" aria-label="Your email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full rounded-2xl"
            />
          </TextField>
        </div>

        <TextField name="ticket-topic" aria-label="Short description">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Short description — what's going on?"
            maxLength={140}
            className="w-full rounded-2xl"
          />
        </TextField>

        <TextArea
          aria-label="Detailed description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more detail — what have you tried, and what were you expecting?"
          className="h-28 w-full rounded-2xl"
        />

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-cha-ink">
          Preferred channel (optional)
          <select
            value={preferredChannel}
            onChange={(e) => setPreferredChannel(e.target.value)}
            className="h-10 w-full max-w-xs rounded-xl border border-cha-border bg-cha-surface px-3 text-sm font-medium text-cha-ink outline-none focus:border-cha-blue"
          >
            <option value="">No preference</option>
            <option value="Email">Email</option>
          </select>
        </label>

        {error && (
          <p role="alert" className="text-[12.5px] font-medium text-red-500">
            {error}
          </p>
        )}

        <AppButton
          onPress={handleSubmit}
          isDisabled={
            submitting || !name.trim() || !email.trim() || !topic.trim() || !description.trim()
          }
          className="self-start"
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : "Submit Request"}
        </AppButton>
      </AppCard>
    </div>
  );
}
