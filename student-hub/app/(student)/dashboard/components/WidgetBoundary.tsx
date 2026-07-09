"use client";

import { Component, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/**
 * Localized error boundary for a single dashboard widget. If that widget's
 * data fetch throws, this shows an inline "Couldn't load — Retry" state
 * without affecting any other widget on the page (per the requirement:
 * other widgets should still render if their own data loads successfully).
 */
class WidgetErrorBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="cha-card flex flex-col items-start gap-2 p-5">
          <p className="text-sm font-medium text-cha-muted">Couldn&apos;t load this widget.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onRetry();
            }}
            className="flex items-center gap-1.5 rounded-full bg-cha-surface-2 px-3.5 py-1.5 text-xs font-semibold text-cha-ink transition-colors hover:bg-cha-border"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function WidgetBoundary({ children }: { children: ReactNode }) {
  const router = useRouter();
  return <WidgetErrorBoundary onRetry={() => router.refresh()}>{children}</WidgetErrorBoundary>;
}
