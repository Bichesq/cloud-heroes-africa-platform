import {
  Award,
  BookOpen,
  CalendarDays,
  KeyRound,
  Laptop,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Maps the icon name stored in HELP_CATEGORIES (plain string, so the data
 * file stays framework-agnostic) to the actual lucide-react component. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  CalendarDays,
  Users,
  BookOpen,
  KeyRound,
  Laptop,
  Award,
};
