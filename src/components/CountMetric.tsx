"use client";

import { animate } from "motion/mini";
import { useEffect, useLayoutEffect, useRef } from "react";

// A gentler ease-out than the site default: the strong default curve finishes the roll in the first 200 ms, too fast to read as counting.
const EASE = "easeOut";
const ROW = 1; // em per strip row

/** "10" -> ["", "10", ""], "3+" -> ["", "3", "+"], "<2%" -> ["<", "2", "%"]. Null when there is no digit run. */
function parse(value: string) {
  const m = /^(\D*)(\d+)(\D*)$/.exec(value);
  return m ? { prefix: m[1], digits: m[2], suffix: m[3] } : null;
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
}: {
  value: string;
  unit?: string;
  label?: string;
  order?: number;
  dust?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const parsed = parse(value);

  // Put the strips at row 0 before the first paint, but only when the count will actually play.
  useLayoutEffect(() => {
    const el = root.current;
    const cl = document.documentElement.classList;
    if (!el || !parsed || !cl.contains("reveal-ready") || cl.contains("cosmos-off")) return;
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
        <p className="t-metric">{value}</p>
        {caption}
      </div>
    );
  }

  const digits = parsed.digits.split("");
  const multi = digits.length > 1;
  return (
    <div ref={root}>
      <p className="t-metric">
        <span className="sr-only">
          {value}
          {unit ? ` ${unit}` : ""}
        </span>
        <span aria-hidden="true" className="odo">
          {parsed.prefix}
          {digits.map((ch, i) => {
            const isOnes = i === digits.length - 1;
            const to = targetRow(Number(ch), isOnes, multi);
            return (
              <span key={i} className="odo-col">
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
          })}
          {parsed.suffix}
          {unit ? <span className="t-metric-unit">{unit}</span> : null}
        </span>
      </p>
      {caption}
    </div>
  );
}
