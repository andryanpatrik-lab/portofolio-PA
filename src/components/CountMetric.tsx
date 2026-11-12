"use client";

import { animate } from "motion/mini";
import { useEffect, useLayoutEffect, useRef } from "react";

// A gentler ease-out than the site default: the strong default curve finishes the roll in the first 200 ms, too fast to read as counting.
const EASE = "easeOut";
const ROW = 1; // em per strip row

type Token = { text: string } | { digits: string };

/** Splits a value into text and digit runs: "23 sec" -> [23, " sec"], "4.54/5" -> [4, ".", 54, "/5"]. Null when there is no digit. */
function parse(value: string): Token[] | null {
  const parts = value.split(/(\d+)/).filter((t) => t !== "");
  if (!parts.some((t) => /^\d+$/.test(t))) return null;
  return parts.map((t) => (/^\d+$/.test(t) ? { digits: t } : { text: t }));
}

/** Motion is allowed: no reduced-motion request, the animations-off switch is not on, and the quality tier is not "off". */
function motionOk() {
  const cl = document.documentElement.classList;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !cl.contains("motion-off") && !cl.contains("cosmos-off");
}

/** Strip rows for one digit column. The ones place runs 0-9 and then 0 again (so 10 counts through 1-9 to 0);
 *  higher places start with a blank row so the count begins at "0 years", not "00 years". */
function rows(isOnes: boolean) {
  return isOnes ? ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] : ["", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
}

/** Final row index of a digit: a zero in the ones place of a multi-digit number lands on the extra 0 row. */
function targetRow(d: number, isOnes: boolean, multi: boolean) {
  return d === 0 && isOnes && multi ? 10 : d;
}

const tx = (row: number) => `translateY(${-row * ROW}em)`;

/**
 * Metric whose digits roll up from 0 like an odometer when it scrolls into view (once). Only transform is animated.
 * The server renders the final state (no-JS, reduced motion and the "off" tier just show it); the visual digits are
 * aria-hidden and the full value is in a screen-reader-only copy.
 */
export function CountMetric({
  value,
  unit,
  label,
  order = 0,
  dust = false,
  always = false,
  numClass = "t-metric",
}: {
  value: string;
  unit?: string;
  label?: string;
  order?: number;
  dust?: boolean;
  /** Also count after client-side navigation (case study pages are reached that way, where `reveal-ready` is removed). */
  always?: boolean;
  numClass?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const parsed = parse(value);

  // Put the strips at row 0 before the first paint, but only when the count will actually play.
  useLayoutEffect(() => {
    const el = root.current;
    const cl = document.documentElement.classList;
    if (!el || !parsed || !(cl.contains("reveal-ready") || (always && motionOk())) || cl.contains("cosmos-off")) return;
    el.querySelectorAll<HTMLElement>("[data-strip]").forEach((s) => (s.style.transform = tx(0)));
    el.dataset.counting = "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || el.dataset.counting === undefined) return;
    const strips = Array.from(el.querySelectorAll<HTMLElement>("[data-strip]"));
    const show = () => strips.forEach((s) => (s.style.transform = tx(Number(s.dataset.to))));
    const run = () => {
      strips.forEach((s) => {
        const to = Number(s.dataset.to);
        // A higher place holds and then moves near the end, like a carry, instead of rolling along with the ones place.
        const a =
          s.dataset.high !== undefined
            ? animate(s, { transform: [tx(0), tx(0), tx(to)] }, { duration: 1.1, delay: order * 0.12, ease: EASE, times: [0, 0.65, 1] })
            : animate(s, { transform: [tx(0), tx(to)] }, { duration: 1.1, delay: order * 0.12, ease: EASE });
        a.finished.then(show, show);
      });
    };
    if (!("IntersectionObserver" in window)) {
      show();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [order]);

  const caption = label ? (
    <p {...(dust ? { "data-dust": "assemble", "data-dust-state": "pending" } : {})} className="t-caption mt-3 max-w-[28ch]">
      {label}
    </p>
  ) : null;

  if (!parsed) {
    return (
      <div>
        <p className={numClass}>{value}</p>
        {caption}
      </div>
    );
  }

  return (
    <div ref={root}>
      <p className={numClass}>
        <span className="sr-only">
          {value}
          {unit ? ` ${unit}` : ""}
        </span>
        <span aria-hidden="true" className="odo">
          {parsed.map((tok, t) => {
            if ("text" in tok) return <span key={t}>{tok.text}</span>;
            const digits = tok.digits.split("");
            const multi = digits.length > 1;
            return digits.map((ch, i) => {
              const isOnes = i === digits.length - 1;
              const to = targetRow(Number(ch), isOnes, multi);
              return (
                <span key={`${t}-${i}`} className="odo-col">
                  <span
                    data-strip=""
                    data-to={to}
                    {...(!isOnes ? { "data-high": "" } : {})}
                    className="odo-strip"
                    style={{ transform: tx(to) }}
                  >
                    {rows(isOnes).map((r, j) => (
                      <span key={j} className="odo-row">
                        {r}
                      </span>
                    ))}
                  </span>
                </span>
              );
            });
          })}
          {unit ? <span className="t-metric-unit">{unit}</span> : null}
        </span>
      </p>
      {caption}
    </div>
  );
}
