"use client";

import type { ButtonProps } from "@heroui/react";
import { Button } from "@heroui/react";
import { tv, type VariantProps } from "tailwind-variants";

/**
 * CHA-styled HeroUI v3 Button (see docs/design-system/components.md
 * "Internal CHA wrappers"). Every color/radius comes from the design
 * tokens in app/globals.css — bg-cha-orange resolves to
 * var(--color-cha-orange), bg-cha-surface-2 to the theme-aware
 * var(--cha-surface-2), etc. Never hardcode hex values here.
 *
 * Usage:
 *   <AppButton onPress={save}>Save changes</AppButton>
 *   <AppButton variant="secondary" size="sm">Preview</AppButton>
 *   <AppButton variant="outline" radius="xl">Cancel</AppButton>
 *   <AppButton variant="ghost" isIconOnly aria-label="Settings"><Settings size={18} /></AppButton>
 *   <AppButton variant="soft" size="sm">In progress</AppButton>
 */
export const appButton = tv({
  base: "font-semibold",
  variants: {
    variant: {
      /* Primary CTA — --color-cha-orange / --color-cha-orange-strong */
      primary: "bg-cha-orange text-white hover:bg-cha-orange-strong",
      /* Secondary CTA — --color-cha-ocean */
      secondary: "bg-cha-ocean text-white hover:bg-cha-ocean/90",
      /* Utility-blue CTA — --color-cha-blue (e.g. calendar "Create Event") */
      accent: "bg-cha-blue text-white hover:bg-cha-blue/90",
      /* Filled dark chip/tab style — --color-cha-eclipse, theme-aware in dark */
      dark: "bg-cha-eclipse text-white hover:bg-cha-eclipse/85 dark:bg-cha-surface-2 dark:hover:bg-cha-surface-2/80",
      /* Neutral outline — theme-aware --cha-border / --cha-surface tokens */
      outline:
        "border-cha-border bg-cha-surface text-cha-ink hover:bg-cha-surface-2",
      /* Low-emphasis utility action */
      ghost: "text-cha-muted hover:bg-cha-surface-2 hover:text-cha-ink",
      /* Soft orange tint — --color-cha-orange-soft (badge-like emphasis) */
      soft: "bg-cha-orange-soft text-cha-orange hover:bg-cha-orange-soft/75 dark:bg-cha-orange/15 dark:text-cha-orange-strong",
      /* Destructive — HeroUI's danger styling is kept as-is */
      danger: "",
    },
    radius: {
      pill: "rounded-full",
      "2xl": "rounded-2xl",
      xl: "rounded-xl",
    },
  },
  defaultVariants: {
    variant: "primary",
    radius: "pill",
  },
});

export type AppButtonVariants = VariantProps<typeof appButton>;

/* Structural base per CHA variant: HeroUI provides layout, focus ring,
 * press/disabled states; the tv() classes above override the colors. */
export const HERO_VARIANT: Record<
  NonNullable<AppButtonVariants["variant"]>,
  ButtonProps["variant"]
> = {
  primary: "primary",
  secondary: "primary",
  accent: "primary",
  dark: "primary",
  outline: "outline",
  ghost: "ghost",
  soft: "secondary",
  danger: "danger",
};

export type AppButtonProps = Omit<ButtonProps, "variant" | "className"> &
  AppButtonVariants & { className?: string };

export default function AppButton({
  className,
  variant = "primary",
  radius,
  ...props
}: AppButtonProps) {
  return (
    <Button
      variant={HERO_VARIANT[variant]}
      className={appButton({ className, radius, variant })}
      {...props}
    />
  );
}
