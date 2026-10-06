/* Sibling ordering for Course Structure moves (plan §8). Pure — unit-tested.
 *
 * Siblings are sorted by (order, id) — ties and gaps are possible in older
 * data since `order` has no unique constraint — and a move returns the full
 * new sequence, which the caller writes back as 1..n. So every move also
 * heals duplicate or gapped orders. */

export type Ordered = { id: string; order: number };

export function sortSiblings<T extends Ordered>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

/** New id sequence after moving `id` one step, or null if it can't move
 * (unknown id, already first/last). */
export function moveOneStep(items: Ordered[], id: string, direction: "up" | "down"): string[] | null {
  const ids = sortSiblings(items).map((i) => i.id);
  const from = ids.indexOf(id);
  if (from === -1) return null;
  const to = direction === "up" ? from - 1 : from + 1;
  if (to < 0 || to >= ids.length) return null;
  [ids[from], ids[to]] = [ids[to], ids[from]];
  return ids;
}

/** Next `order` for an item appended at the end. */
export function nextOrder(items: Ordered[]): number {
  return items.reduce((max, i) => Math.max(max, i.order), 0) + 1;
}
