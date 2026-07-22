"use client";

import { Maximize, Pause, Play, Square } from "lucide-react";
import type { useSpeech } from "@/lib/tts/useSpeech";

/* Local TTS control bar (mockup: play/stop, voice picker, rate, fullscreen —
 * WITHOUT the prev/next arrows, removed as redundant with "Go to Next Item"
 * per decision 2026-07-16). Speech is generated on-device by the Web Speech
 * API: zero media bytes downloaded (data-light strategy). */

const RATES = [0.75, 1, 1.25, 1.5];

type Speech = ReturnType<typeof useSpeech>;

export default function TtsControlBar({
  speech,
  script,
}: {
  speech: Speech;
  script: string;
}) {
  const { status, voices, voiceURI, rate } = speech;

  if (status === "unsupported") {
    return (
      <p className="text-xs text-cha-faint">
        Read-aloud isn&apos;t supported in this browser.
      </p>
    );
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Play / pause */}
      {status === "playing" ? (
        <ControlButton
          label="Pause reading"
          className="bg-cha-orange text-white hover:bg-cha-orange-strong"
          onClick={() => speech.pause()}
        >
          <Pause size={15} fill="currentColor" />
        </ControlButton>
      ) : status === "paused" ? (
        <ControlButton
          label="Resume reading"
          className="bg-cha-orange text-white hover:bg-cha-orange-strong"
          onClick={() => speech.resume()}
        >
          <Play size={15} fill="currentColor" />
        </ControlButton>
      ) : (
        <ControlButton
          label="Read this lesson aloud"
          className="bg-cha-orange text-white hover:bg-cha-orange-strong"
          onClick={() => speech.play(script)}
        >
          <Play size={15} fill="currentColor" />
        </ControlButton>
      )}

      {/* Stop */}
      <ControlButton
        label="Stop reading"
        className="bg-cha-eclipse text-white hover:bg-cha-eclipse/85 dark:bg-cha-surface-2"
        onClick={() => speech.stop()}
      >
        <Square size={13} fill="currentColor" />
      </ControlButton>

      {/* Voice picker */}
      <select
        value={voiceURI ?? ""}
        onChange={(e) => speech.changeVoice(e.target.value)}
        aria-label="Text-to-speech voice"
        className="h-9 max-w-[290px] min-w-0 flex-1 truncate rounded-lg border border-cha-border bg-cha-surface px-2.5 text-[13px] font-medium text-cha-ink outline-none focus:border-cha-blue sm:flex-none"
      >
        {voices.length === 0 && <option value="">Loading voices…</option>}
        {voices.map((v) => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {v.name} - {v.lang}
          </option>
        ))}
      </select>

      {/* Rate */}
      <select
        value={rate}
        onChange={(e) => speech.changeRate(parseFloat(e.target.value))}
        aria-label="Reading speed"
        className="h-9 rounded-lg border border-cha-border bg-cha-surface px-2 text-[13px] font-medium text-cha-ink outline-none focus:border-cha-blue"
      >
        {RATES.map((r) => (
          <option key={r} value={r}>
            {r}x
          </option>
        ))}
      </select>

      {/* Fullscreen */}
      <ControlButton
        label="Toggle fullscreen"
        className="bg-cha-ocean text-white hover:bg-cha-ocean/90"
        onClick={toggleFullscreen}
      >
        <Maximize size={15} />
      </ControlButton>
    </div>
  );
}

function ControlButton({
  label,
  className,
  onClick,
  children,
}: {
  label: string;
  className: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
