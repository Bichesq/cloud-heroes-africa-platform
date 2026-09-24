"use client";

import { Button, ListBox, Select } from "@heroui/react";
import { Maximize, Pause, Play, Square } from "lucide-react";
import type { useSpeech } from "@/lib/tts/useSpeech";

/* Local TTS control bar (Figma controls row: play/stop, voice picker, rate,
 * fullscreen). Speech is generated on-device by the Web Speech API: zero
 * media bytes downloaded (data-light strategy). Topic Previous/Next sit
 * beside it in ReadingView, not in here. */

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
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Play / pause */}
      {status === "playing" ? (
        <Button isIconOnly size="sm" aria-label="Pause reading" onPress={() => speech.pause()}>
          <Pause size={15} fill="currentColor" />
        </Button>
      ) : (
        <Button
          isIconOnly
          size="sm"
          aria-label={status === "paused" ? "Resume reading" : "Read this topic aloud"}
          onPress={() => (status === "paused" ? speech.resume() : speech.play(script))}
        >
          <Play size={15} fill="currentColor" />
        </Button>
      )}

      {/* Stop */}
      <Button
        isIconOnly
        size="sm"
        variant="secondary"
        aria-label="Stop reading"
        onPress={() => speech.stop()}
      >
        <Square size={13} fill="currentColor" />
      </Button>

      {/* Voice picker */}
      <Select
        aria-label="Text-to-speech voice"
        placeholder="Loading voices…"
        isDisabled={voices.length === 0}
        value={voiceURI ?? null}
        onChange={(key) => typeof key === "string" && speech.changeVoice(key)}
        className="w-[260px] max-w-full"
      >
        <Select.Trigger>
          <Select.Value className="truncate text-[13px]" />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {voices.map((v) => (
              <ListBox.Item key={v.voiceURI} id={v.voiceURI} textValue={`${v.name} - ${v.lang}`}>
                {v.name} - {v.lang}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      {/* Rate */}
      <Select
        aria-label="Reading speed"
        value={String(rate)}
        onChange={(key) => typeof key === "string" && speech.changeRate(parseFloat(key))}
        className="w-[84px]"
      >
        <Select.Trigger>
          <Select.Value className="text-[13px]" />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {RATES.map((r) => (
              <ListBox.Item key={r} id={String(r)} textValue={`${r}x`}>
                {r}x
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      {/* Fullscreen */}
      <Button
        isIconOnly
        size="sm"
        variant="tertiary"
        aria-label="Toggle fullscreen"
        onPress={toggleFullscreen}
      >
        <Maximize size={15} />
      </Button>
    </div>
  );
}
