
"use client";

import type { ComponentProps } from "react";
import { Card } from "@heroui/react";
import { tv, type VariantProps } from "tailwind-variants";

/**
 * CHA-styled HeroUI v3 Card (see docs/design-system/components.md
 * "Internal CHA wrappers"). Surfaces, borders, and shadows come from
 * the design tokens in app/globals.css: `raised`/`outline` reuse the
 * .cha-card / .cha-card-outline component classes, `sunken` uses the
 * theme-aware var(--cha-surface-2), and the brand variants use
 * --color-cha-orange / --color-cha-ocean.
 *
 * The underlying Card is rendered variant="transparent" so HeroUI's
 * own surface styling never fights the CHA tokens.
 *
 * Usage:
 *   <AppCard>
 *     <AppCard.Header>
 *       <AppCard.Title>Learning Path</AppCard.Title>
 *       <AppCard.Description>4 of 12 modules completed</AppCard.Description>
 *     </AppCard.Header>
 *     <AppCard.Content>…</AppCard.Content>
 *     <AppCard.Footer><AppButton size="sm">Continue</AppButton></AppCard.Footer>
 *   </AppCard>
 *
 *   <AppCard variant="brand" padding="lg">…hero CTA content…</AppCard>
 *   <AppCard variant="outline" padding="none">…table/list rows…</AppCard>
 *
 * Note: inside `brand`/`ocean` cards text is white; give descriptions
 * an explicit className="text-white/80" there.
 */
const appCard = tv({
  base: "rounded-3xl",
  variants: {
    variant: {
      /* Default raised panel — --cha-surface + card shadow (globals.css) */
      raised: "cha-card",
      /* Bordered, flat — --cha-border on --cha-surface */
      outline: "cha-card-outline",
      /* Sunken/hover surface — theme-aware --cha-surface-2 */
      sunken: "bg-cha-surface-2",
      /* Orange feature card (e.g. "Resume Where You Left Off") */
      brand:
        "bg-cha-orange text-white shadow-[0_8px_24px_rgba(232,84,26,0.18)]",
      /* Ocean feature card (e.g. "New Course") */
      ocean:
        "bg-cha-ocean text-white shadow-[0_8px_24px_rgba(50,167,212,0.2)]",
    },
    padding: {
      md: "p-5",
      lg: "p-[26px]",
      none: "p-0",
    },
  },
  defaultVariants: {
    variant: "raised",
    padding: "md",
  },
});

type AppCardVariants = VariantProps<typeof appCard>;

export type AppCardProps = Omit<
  ComponentProps<typeof Card>,
  "variant" | "className"
> &
  AppCardVariants & { className?: string };

function AppCardRoot({ className, variant, padding, ...props }: AppCardProps) {
  return (
    <Card
      variant="transparent"
      className={appCard({ className, variant, padding })}
      {...props}
    />
  );
}

/* Card title role from tokens.md — display font, card-title size. */
const appCardTitle = tv({
  base: "font-display text-xl font-bold leading-snug",
});

function AppCardTitle({
  className,
  ...props
}: ComponentProps<typeof Card.Title>) {
  return <Card.Title className={appCardTitle({ className })} {...props} />;
}

const AppCard = Object.assign(AppCardRoot, {
  Header: Card.Header,
  Title: AppCardTitle,
  Description: Card.Description,
  Content: Card.Content,
  Footer: Card.Footer,
});

export default AppCard;
