import Image from "next/image";
import { Link } from "@heroui/react";

export default function Footer() {
  return (
    <footer id="support" className="border-t border-cha-border">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3.5 px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo_cha.png"
            alt="Cloud Heroes Africa"
            width={30}
            height={30}
            className="rounded-lg"
          />
          <span className="text-xs text-cha-muted">
            © {new Date().getFullYear()} Cloud Heroes Africa. Empowering
            Africans to build world-class cloud careers.
          </span>
        </div>
        <div className="flex gap-5 text-xs text-cha-muted">
          <Link href="#support" className="text-cha-muted hover:text-cha-ink">
            Support
          </Link>
          <Link href="#community" className="text-cha-muted hover:text-cha-ink">
            Community
          </Link>
          <Link href="/SignIn" className="text-cha-muted hover:text-cha-ink">
            Sign In
          </Link>
        </div>
      </div>
    </footer>
  );
}
