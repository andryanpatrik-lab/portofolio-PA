"use client";

import { useEffect, useRef, useState } from "react";
import { isFlowSlug, loadFlowStructure, loadFlowsDict, type FlowSlug, type FlowsDict } from "@/lib/flows";
import type { FlowViewer } from "@/lib/flowViewer";
import type { Locale } from "@/lib/i18n";

export type FlowSummary = { slug: FlowSlug; title: string; desc: string; steps: number };

type Props = {
  locale: Locale;
  summaries: FlowSummary[];
  labels: { pickFlow: string; openFull: string; loading: string; noScript: string; hint: string };
  /** Link to the full-screen explorer. Omit on the explorer page itself. */
  fullHref?: string;
  /** Full-screen mode: the mouse wheel zooms, the viewer fills the viewport height, and `#alur=<slug>` selects a flow. */
  full?: boolean;
};

/**
 * Loads the interactive viewer and its data only when the section scrolls near the viewport, so the page itself stays light.
 * Nothing plays on its own: playback starts only from the Play button (see flowViewer.ts).
 */
export function FlowExplorer({ locale, summaries, labels, fullHref, full = false }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const viewer = useRef<FlowViewer | null>(null);
  const dict = useRef<FlowsDict | null>(null);
  const [active, setActive] = useState<FlowSlug>(summaries[0].slug);
  const [near, setNear] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  // Start loading when the section is about to be seen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Full-screen page: honour #alur=<slug> and keep the hash in step with the selection.
  useEffect(() => {
    if (!full) return;
    const read = () => {
      const m = /alur=([a-z]+)/.exec(window.location.hash);
      if (m && isFlowSlug(m[1]) && summaries.some((s) => s.slug === m[1])) setActive(m[1]);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [full, summaries]);

  // Build (or rebuild) the viewer for the active flow.
  useEffect(() => {
    if (!near || !host.current) return;
    let cancelled = false;
    setState("loading");
    (async () => {
      try {
        const [d, structure, mod] = await Promise.all([
          dict.current ? Promise.resolve(dict.current) : loadFlowsDict(locale),
          loadFlowStructure(active),
          import("@/lib/flowViewer"),
        ]);
        if (cancelled || !host.current) return;
        dict.current = d;
        viewer.current?.destroy();
        viewer.current = new mod.FlowViewer(host.current, structure, d.flows[active], d.ui, {
          captureWheel: full,
        });
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [near, active, locale, full]);

  useEffect(() => () => viewer.current?.destroy(), []);

  const pick = (slug: FlowSlug) => {
    setActive(slug);
    if (full) window.history.replaceState(null, "", `#alur=${slug}`);
  };

  return (
    <div ref={wrap} className={full ? "fv-shell fv-shell-full" : "fv-shell"}>
      <div className="fv-picker" role="group" aria-label={labels.pickFlow}>
        {summaries.map((s) => (
          <button key={s.slug} type="button" className="fv-flow-chip" aria-pressed={s.slug === active} onClick={() => pick(s.slug)}>
            <span>{s.title}</span>
            <small>{s.steps}</small>
          </button>
        ))}
        {fullHref && (
          <a className="fv-open link-underline t-label tap" href={fullHref}>
            {labels.openFull} <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
      <div className="fv-stage-wrap">
        <div ref={host} className="fv-host" data-state={state} aria-busy={state === "loading"} />
        {state !== "ready" && (
          <p className="fv-status t-caption" role="status">
            {state === "error" ? labels.noScript : labels.loading}
          </p>
        )}
      </div>
      {!full && <p className="t-caption fv-hint">{labels.hint}</p>}
      <noscript>
        <p className="t-caption">{labels.noScript}</p>
      </noscript>
      <ul className="fv-summary sr-only">
        {summaries.map((s) => (
          <li key={s.slug}>
            {s.title}: {s.desc}
          </li>
        ))}
      </ul>
    </div>
  );
}
