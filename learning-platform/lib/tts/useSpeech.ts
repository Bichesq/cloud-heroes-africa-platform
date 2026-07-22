"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { scriptToChunks } from "./serialize";

/* Local text-to-speech over the Web Speech API — the platform's data-light
 * delivery core (decision 2026-07-06: static visuals + local TTS, no
 * streaming media, no stored audio).
 *
 * Browser quirks handled here:
 *  - Chrome populates getVoices() asynchronously → listen to voiceschanged.
 *  - Chrome silently kills long utterances and auto-pauses speech ~15s in →
 *    speak sentence-sized chunks and run a resume() keep-alive interval.
 *  - Voice lists differ per OS/browser → never hardcode names; persist the
 *    student's chosen voice URI + rate in localStorage.
 */

export type SpeechStatus = "unsupported" | "idle" | "playing" | "paused";

const VOICE_KEY = "lp_tts_voice";
const RATE_KEY = "lp_tts_rate";

export function useSpeech() {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string | null>(null);
  const [rate, setRate] = useState(1);

  const chunksRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const cancelledRef = useRef(false);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---- capability + voice discovery ---- */
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatus("unsupported");
      return;
    }

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      if (list.length === 0) return;
      setVoices(list);
      const saved = localStorage.getItem(VOICE_KEY);
      const preferred =
        (saved && list.find((v) => v.voiceURI === saved)) ||
        list.find((v) => v.lang.startsWith("en") && v.default) ||
        list.find((v) => v.lang.startsWith("en")) ||
        list[0];
      setVoiceURI((current) => current ?? preferred.voiceURI);
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    const savedRate = parseFloat(localStorage.getItem(RATE_KEY) ?? "1");
    if (savedRate > 0) setRate(savedRate);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const clearKeepAlive = () => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  };

  const speakNext = useCallback(
    (voice: SpeechSynthesisVoice | undefined, speakRate: number) => {
      if (cancelledRef.current) return;
      const chunk = chunksRef.current[indexRef.current];
      if (!chunk) {
        clearKeepAlive();
        setStatus("idle");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      if (voice) utterance.voice = voice;
      utterance.rate = speakRate;
      utterance.onend = () => {
        indexRef.current += 1;
        speakNext(voice, speakRate);
      };
      utterance.onerror = () => {
        clearKeepAlive();
        if (!cancelledRef.current) setStatus("idle");
      };
      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const play = useCallback(
    (text: string) => {
      if (status === "unsupported") return;
      window.speechSynthesis.cancel();
      cancelledRef.current = false;
      chunksRef.current = scriptToChunks(text);
      indexRef.current = 0;

      const voice = voices.find((v) => v.voiceURI === voiceURI);
      setStatus("playing");
      speakNext(voice, rate);

      // Chrome auto-pause workaround — nudge the queue while playing.
      clearKeepAlive();
      keepAliveRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
    },
    [status, voices, voiceURI, rate, speakNext]
  );

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setStatus("playing");
  }, []);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    clearKeepAlive();
    window.speechSynthesis.cancel();
    setStatus("idle");
  }, []);

  const changeVoice = useCallback(
    (uri: string) => {
      setVoiceURI(uri);
      localStorage.setItem(VOICE_KEY, uri);
      stop();
    },
    [stop]
  );

  const changeRate = useCallback(
    (newRate: number) => {
      setRate(newRate);
      localStorage.setItem(RATE_KEY, String(newRate));
      stop();
    },
    [stop]
  );

  /* Stop speech when the reading unmounts (route change). */
  useEffect(() => stop, [stop]);

  return {
    status,
    voices,
    voiceURI,
    rate,
    play,
    pause,
    resume,
    stop,
    changeVoice,
    changeRate,
  };
}
