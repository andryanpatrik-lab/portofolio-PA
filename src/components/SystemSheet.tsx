import { CountMetric } from "./CountMetric";
import type { CaseStudyData } from "@/lib/i18n";

type Item = NonNullable<CaseStudyData["system"]>[number];

// Column counts are explicit so Tailwind can see the class names and no row ever ends with an empty cell.
const COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "sm:grid-cols-2 lg:grid-cols-3",
};

/**
 * "System structure" as a spec sheet: one bordered panel, hairline dividers, a large mono figure per cell, a small label,
 * and one plain-language line saying what the figure means. The figures roll up like an odometer when they scroll into view.
 */
export function SystemSheet({ items }: { items: Item[] }) {
  return (
    <ul className={`sys-sheet mt-10 grid grid-cols-1 ${COLS[items.length] ?? "sm:grid-cols-3"}`}>
      {items.map((item, i) => (
        <li key={item.label} className="sys-cell">
          <CountMetric value={item.value} numClass="sys-num" order={i} always />
          <p className="sys-label t-label">{item.label}</p>
          {item.note && <p className="sys-note t-caption">{item.note}</p>}
        </li>
      ))}
    </ul>
  );
}
