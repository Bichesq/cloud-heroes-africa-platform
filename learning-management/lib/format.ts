/* Display helpers shared by the authoring screens. Pure — unit-tested. */

type Person = { name: string; email: string };

/** Authors created by email only (bootstrap, dev login) have no name yet. */
export function displayName(p: Person): string {
  return p.name.trim() || p.email;
}

/** Figma Programs table: "Today, 09:42" for today, else "Sep 8, 2026".
 * Rendered on the server in its local time zone. */
export function formatUpdated(date: Date, now: Date = new Date()): string {
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `Today, ${time}`;
  }
  return formatDate(date);
}

/** Figma Settings & Access "Date Added": "Sep 8, 2026". */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
