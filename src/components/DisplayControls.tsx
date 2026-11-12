"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { getTheme, isMotionOff, setMotionOff, setMotionOn, setTheme, systemWantsReducedMotion, type Theme } from "@/lib/prefs";
import type { Dictionary } from "@/lib/i18n";

const subscribe = (cb: () => void) => {
  window.addEventListener("pref-theme", cb);
  window.addEventListener("pref-motion-off", cb);
  return () => {
    window.removeEventListener("pref-theme", cb);
    window.removeEventListener("pref-motion-off", cb);
  };
};

const CHIP: Record<Theme, string> = {
  "": "linear-gradient(135deg, #0c0a09 50%, #e9e8e6 50%)",
  dark: "#0c0a09",
  grey: "#e9e8e6",
  cream: "#f1ebdd",
};

/**
 * "Tampilan" controls in the header: a switch that stops every animation, and a palette button that opens a small panel
 * to pick one flat colour for the whole site. Preferences live in src/lib/prefs.ts.
 */
export function DisplayControls({ text }: { text: Dictionary["display"] }) {
  const motionOff = useSyncExternalStore(subscribe, isMotionOff, () => false);
  const theme = useSyncExternalStore(subscribe, getTheme, () => "" as Theme);
  const system = useSyncExternalStore(subscribe, systemWantsReducedMotion, () => false);
  const [open, setOpen] = useState(false);
  // the controls can appear twice (header and entry intro): ids and radio names must be unique
  const uid = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const paletteBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        paletteBtn.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const off = motionOff || system;
  const options: { value: Theme; label: string }[] = [
    { value: "", label: text.themeDefault },
    { value: "dark", label: text.themeDark },
    { value: "grey", label: text.themeGrey },
    { value: "cream", label: text.themeCream },
  ];

  return (
    <div ref={wrap} className="dc">
      <button
        type="button"
        className="dc-btn"
        aria-pressed={off}
        aria-label={system ? text.motionSystem : off ? text.motionOn : text.motionOff}
        title={system ? text.motionSystem : off ? text.motionOn : text.motionOff}
        disabled={system}
        onClick={() => (motionOff ? setMotionOn() : setMotionOff())}
      >
        {off ? (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
        )}
      </button>
      <button
        ref={paletteBtn}
        type="button"
        className="dc-btn"
        aria-expanded={open}
        aria-controls={`dc-panel-${uid}`}
        aria-label={text.colors}
        title={text.colors}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <fieldset id={`dc-panel-${uid}`} className="dc-panel">
          <legend className="t-label dc-legend">{text.colors}</legend>
          {options.map((o) => (
            <label key={o.value || "default"} className="dc-opt">
              <input type="radio" name={`page-colour-${uid}`} value={o.value} checked={theme === o.value} onChange={() => setTheme(o.value)} />
              <span aria-hidden="true" className="dc-chip" style={{ background: CHIP[o.value] }} />
              <span>{o.label}</span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
}
