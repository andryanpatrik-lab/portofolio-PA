"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { isFlowSlug, loadFlowStructure, loadFlowsDict, type FlowSlug, type FlowsDict } from "@/lib/flows";
import type { FlowViewer } from "@/lib/flowViewer";
import type { Locale } from "@/lib/i18n";

export type FlowSummary = {
  slug: FlowSlug;
  title: string;
  desc: string;
  badge?: string;
  steps: number;
  stages: { title: string; desc: string }[];
  /** Card the flow belongs to (only needed when several cards share one explorer). */
  group?: string;
};

type Props = {
  locale: Locale;
  summaries: FlowSummary[];
  labels: { pickFlow: string; openFull: string; loading: string; noScript: string; hint: string; mobileNote: string };
  /** Card chips for the full-screen explorer, which lists the flows of every card. */
  groups?: { id: string; title: string }[];
  /** Link to the full-screen explorer. Omit on the explorer page itself. */
  fullHref?: string;
  /** Full-screen mode: the mouse wheel zooms, the viewer fills the viewport height, and `#alur=<slug>` selects a flow. */
  full?: boolean;
};

const NARROW = "(max-width: 699px)";
const subscribeNarrow = (cb: () => void) => {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Loads the interactive viewer and its data only when the section scrolls near the viewport, so the page itself stays light.
 * Nothing plays on its own: playback starts only from the Play button (see flowViewer.ts).
 * On a phone (narrow screen) the diagram is not loaded at all: the text summary below is shown instead (decided by Patrik).
 */
export function FlowExplorer({ locale, summaries, labels, groups, fullHref, full = false }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const viewer = useRef<FlowViewer | null>(null);
  const dict = useRef<FlowsDict | null>(null);
  const [active, setActive] = useState<FlowSlug>(summaries[0].slug);
  const [near, setNear] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW).matches, () => false);

  const activeGroup = summaries.find((s) => s.slug === active)?.group;
  const visible = groups && activeGroup ? summaries.filter((s) => s.group === activeGroup) : summaries;

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

  // Build (or rebuild) the viewer for the active flow. Never on a phone.
  useEffect(() => {
    if (!near || narrow || !host.current) return;
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
        viewer.current = new mod.FlowViewer(host.current, structure, d.flows[active], d.ui, { captureWheel: full });
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [near, narrow, active, locale, full]);

  // Leaving the wide layout (phone rotated or window shrunk) drops the viewer.
  useEffect(() => {
    if (narrow) {
      viewer.current?.destroy();
      viewer.current = null;
    }
  }, [narrow]);
  useEffect(() => () => viewer.current?.destroy(), []);

  const pick = (slug: FlowSlug) => {
    setActive(slug);
    if (full) window.history.replaceState(null, "", `#alur=${slug}`);
  };
  const pickGroup = (id: string) => {
    const first = summaries.find((s) => s.group === id);
    if (first) pick(first.slug);
  };

  return (
    <div ref={wrap} className={full ? "fv-shell fv-shell-full" : "fv-shell"}>
      <div className="fv-desktop">
        {groups && (
          <div className="fv-picker fv-groups" role="group" aria-label={labels.pickFlow}>
            {groups.map((g) => (
              <button key={g.id} type="button" className="fv-flow-chip" aria-pressed={g.id === activeGroup} onClick={() => pickGroup(g.id)}>
                <span>{g.title}</span>
              </button>
            ))}
          </div>
        )}
        <div className="fv-picker" role="group" aria-label={labels.pickFlow}>
          {visible.map((s) => (
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
      </div>

      {/* Phone and no-JS fallback: plain text, rendered on the server. */}
      <div className="fv-mobile">
        <p className="t-caption">{labels.mobileNote}</p>
        <ul className="fv-text-list">
          {summaries.map((s) => (
            <li key={s.slug} className="fv-text-item">
              <h3 className="t-h4">{s.title}</h3>
              {s.badge && <p className="t-caption fv-text-badge">{s.badge}</p>}
              <p className="fv-text-desc">{s.desc}</p>
              <ol className="fv-text-stages">
                {s.stages.map((st, i) => (
                  <li key={i}>
                    <strong>{st.title}.</strong> {st.desc}
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      </div>
      <noscript>
        <style>{".fv-desktop{display:none!important}.fv-mobile{display:block!important}"}</style>
      </noscript>
    </div>
  );
}
