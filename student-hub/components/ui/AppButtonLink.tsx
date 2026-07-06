"use client";

import type { ButtonProps } from "@heroui/react";
import { buttonVariants } from "@heroui/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { appButton, HERO_VARIANT, type AppButtonVariants } from "./AppButton";

/**
 * AppButton's styling applied to a plain anchor. HeroUI's `Button`/`Link`
 * `render` prop requires the returned element to match the component's
 * default DOM tag (button/a) — wrapping Button and returning an `<a>` trips
 * its dev-mode DOM-mismatch warning. Per HeroUI's docs ("Direct Class
 * Application"), framework links should apply the computed BEM classes
 * straight to the native/framework anchor instead of going through `render`.
 *
 * Usage:
 *   <AppButtonLink href="/SignIn">Sign In</AppButtonLink>
 *   <AppButtonLink href={REGISTRATION_URL} external variant="dark">Apply to Join</AppButtonLink>
 */
export type AppButtonLinkProps = AppButtonVariants &
  Pick<ButtonProps, "size" | "fullWidth" | "isIconOnly"> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children"> & {
    href: string;
    external?: boolean;
    className?: string;
    children?: ReactNode;
  };

export default function AppButtonLink({
  href,
  external,
  variant = "primary",
  radius,
  size,
  fullWidth,
  isIconOnly,
  className,
  ...rest
}: AppButtonLinkProps) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={buttonVariants({
        variant: HERO_VARIANT[variant],
        size,
        fullWidth,
        isIconOnly,
        className: appButton({ className, radius, variant }),
      })}
      {...rest}
    />
  );
}
