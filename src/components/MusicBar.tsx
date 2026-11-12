"use client";

import { useSyncExternalStore } from "react";
import { isMusicOn, musicAvailable, toggleMusic } from "@/lib/music";

const subscribe = (cb: () => void) => {
  window.addEventListener("music-change", cb);
  return () => window.removeEventListener("music-change", cb);
};

/**
 * Small floating music bar in the bottom-left corner (only when a music file is configured in content/site.json).
 * A dark pill with its own colours so it reads on the dark pages, the light pages and every colour theme.
 */
export function MusicBar({ label, on, off }: { label: string; on: string; off: string }) {
  const ready = useSyncExternalStore(subscribe, musicAvailable, () => false);
  const playing = useSyncExternalStore(subscribe, isMusicOn, () => false);
  if (!ready) return null;
  return (
    <div role="group" aria-label={label} className="music-bar">
      <button type="button" className="music-btn" data-music-toggle="" aria-pressed={playing} aria-label={playing ? off : on} title={playing ? off : on} onClick={toggleMusic}>
        {playing ? (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        )}
      </button>
      <span aria-hidden="true" className={`music-eq${playing ? " is-playing" : ""}`}>
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="music-label t-label">{label}</span>
    </div>
  );
}
