import type { Faq, HelpCategory, SupportDesk } from "@/types";

/* Pure self-service search logic — no I/O, unit-testable. Isolated here so a
 * real knowledge-base/search API can replace searchFaqs' internals later
 * without touching any component that calls it. */

/** Case-insensitive match against question + answer text, ranked with
 * question-text matches first. Empty query returns no results (callers show
 * the passive/browse state instead). */
export function searchFaqs(query: string, faqs: Faq[]): Faq[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const inQuestion: Faq[] = [];
  const inAnswerOnly: Faq[] = [];

  for (const faq of faqs) {
    const question = faq.question.toLowerCase();
    if (question.includes(q)) {
      inQuestion.push(faq);
    } else if (faq.answer.toLowerCase().includes(q)) {
      inAnswerOnly.push(faq);
    }
  }

  return [...inQuestion, ...inAnswerOnly];
}

export function filterByCategory(categoryId: string | null, faqs: Faq[]): Faq[] {
  if (!categoryId) return faqs;
  return faqs.filter((f) => f.categoryId === categoryId);
}

export function categoriesForDesk(
  desk: SupportDesk,
  categories: HelpCategory[]
): HelpCategory[] {
  return categories.filter((c) => c.desk === desk);
}

export function deskForCategory(
  categoryId: string | null,
  categories: HelpCategory[]
): SupportDesk | null {
  if (!categoryId) return null;
  return categories.find((c) => c.id === categoryId)?.desk ?? null;
}
