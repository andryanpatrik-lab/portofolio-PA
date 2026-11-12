import { useId, type ReactNode } from "react";
import type { Skeleton } from "@/lib/n8nSkeletons";

// Geometry: node positions come from the real workflow, scaled a little. Nodes are rounded squares with the name underneath.
const SCALE = 0.85;
const S = 72; // node square
const LABEL_H = 54; // name and type under the square
const PAD = 48;
const OUT = 12; // vertical spread of the two outputs of an IF node

type Kind = { label: string; cls: string; trigger?: boolean; icon: ReactNode };

// Simple stroke icons drawn for this site (not n8n's own artwork).
const I = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const ICON = {
  webhook: I(<><path d="M4 12h9M10 8l4 4-4 4" /><path d="M18 6v12" /></>),
  schedule: I(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>),
  code: I(<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" />),
  http: I(<><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5S14.5 18 12 20.5C9.5 18 8.5 15 8.5 12S9.5 6 12 3.5z" /></>),
  database: I(<><ellipse cx="12" cy="6" rx="7" ry="2.8" /><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" /></>),
  branch: I(<><circle cx="6" cy="12" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 12h3c2.2 0 3.2-2.5 5-5M11 12c2.2 0 3.2 2.5 5 5" /></>),
  reply: I(<><path d="M9 7L4 12l5 5" /><path d="M4 12h9a7 7 0 017 7" /></>),
  error: I(<><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17.2v.1" /></>),
};

const KIND: Record<string, Kind> = {
  scheduleTrigger: { label: "Schedule Trigger", cls: "trigger", trigger: true, icon: ICON.schedule },
  webhook: { label: "Webhook", cls: "trigger", trigger: true, icon: ICON.webhook },
  errorTrigger: { label: "Error Trigger", cls: "trigger", trigger: true, icon: ICON.error },
  code: { label: "Code", cls: "code", icon: ICON.code },
  httpRequest: { label: "HTTP Request", cls: "http", icon: ICON.http },
  postgres: { label: "Database", cls: "db", icon: ICON.database },
  if: { label: "IF", cls: "if", icon: ICON.branch },
  respondToWebhook: { label: "Respond to Webhook", cls: "reply", icon: ICON.reply },
};

/**
 * Static, script-free imitation of an n8n canvas: dotted grid, rounded square nodes with an icon and the name underneath,
 * ports, and curved arrows. No animation. The wrapper scrolls sideways and is focusable so keyboard users can move through
 * wide workflows. It borrows the look and feel of n8n, not its logo or icons.
 */
export function N8nCanvas({ data, label, hint }: { data: Skeleton; label: string; hint: string }) {
  const arrowId = `n8n-arrow-${useId().replace(/:/g, "")}`;
  const nodes = data.nodes.filter((n) => n.type !== "n8n-nodes-base.stickyNote");
  const minX = Math.min(...nodes.map((n) => n.position[0]));
  const minY = Math.min(...nodes.map((n) => n.position[1]));
  const maxX = Math.max(...nodes.map((n) => n.position[0]));
  const maxY = Math.max(...nodes.map((n) => n.position[1]));
  const width = Math.round((maxX - minX) * SCALE + S + PAD * 2);
  const height = Math.round((maxY - minY) * SCALE + S + LABEL_H + PAD * 2);
  const place = new Map(
    nodes.map((n) => [n.name, { x: Math.round((n.position[0] - minX) * SCALE + PAD), y: Math.round((n.position[1] - minY) * SCALE + PAD) }]),
  );
  const kindOf = (type: string): Kind => KIND[type.split(".").pop() ?? ""] ?? { label: "Node", cls: "code", icon: ICON.code };
  const typeOf = new Map(nodes.map((n) => [n.name, n.type]));
  // Ports are drawn on the side where a line really leaves or enters. Vertical lines (snake layouts) get no port dots.
  const ports = new Map<string, Map<string, { side: "l" | "r"; dy: number }>>();
  const addPort = (node: string, side: "l" | "r", dy: number) => {
    const m = ports.get(node) ?? new Map();
    m.set(`${side}${dy}`, { side, dy });
    ports.set(node, m);
  };
  const hasOutgoing = new Set(Object.keys(data.connections).filter((k) => data.connections[k].main.some((o) => o.length)));

  const edges: { d: string; key: string }[] = [];
  const tags: { text: string; x: number; y: number; key: string }[] = [];
  for (const [from, v] of Object.entries(data.connections)) {
    const a = place.get(from);
    if (!a) continue;
    const isIf = typeOf.get(from)?.endsWith(".if");
    v.main.forEach((outs, outIndex) => {
      // a node with two outputs (IF) has its ports a little above and below the middle of its right side
      const spread = v.main.length > 1 ? (outIndex === 0 ? -OUT : OUT) : 0;
      for (const c of outs) {
        const b = place.get(c.node);
        if (!b) continue;
        let d: string;
        let tx = 0;
        let ty = 0;
        if (b.x >= a.x + S) {
          // target to the right: leave the output port, enter the input port
          const x1 = a.x + S;
          const y1 = a.y + S / 2 + spread;
          const x2 = b.x;
          const y2 = b.y + S / 2;
          const dx = Math.max(8, Math.abs(x2 - x1) / 2);
          d = `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
          addPort(from, "r", spread);
          addPort(c.node, "l", 0);
          tx = x1 + 6;
          ty = y1 - 16;
        } else if (b.x + S <= a.x) {
          // the line turns back (snake layout): leave the left side, enter the right side
          const x1 = a.x;
          const y1 = a.y + S / 2 + spread;
          const x2 = b.x + S;
          const y2 = b.y + S / 2;
          const dx = Math.max(8, Math.abs(x1 - x2) / 2);
          d = `M${x1} ${y1} C${x1 - dx} ${y1}, ${x2 + dx} ${y2}, ${x2} ${y2}`;
          addPort(from, "l", spread);
          addPort(c.node, "r", 0);
          tx = x1 - 30;
          ty = y1 - 16;
        } else {
          // same column: go below the name (or above the node) and enter the opposite side
          const down = b.y >= a.y;
          const x1 = a.x + S / 2;
          const y1 = down ? a.y + S + LABEL_H : a.y;
          const x2 = b.x + S / 2;
          const y2 = down ? b.y : b.y + S + LABEL_H;
          const dy = Math.max(20, Math.abs(y2 - y1) / 2);
          d = `M${x1} ${y1} C${x1} ${y1 + (down ? dy : -dy)}, ${x2} ${y2 + (down ? -dy : dy)}, ${x2} ${y2}`;
          tx = x1 + 6;
          ty = y1 + (down ? 2 : -18);
        }
        edges.push({ key: `${from}>${c.node}>${outIndex}`, d });
        if (isIf) tags.push({ key: `${from}>${c.node}>${outIndex}t`, text: outIndex === 0 ? "true" : "false", x: tx, y: ty });
      }
    });
  }

  const ordered = [...nodes].sort((p, q) => p.position[0] - q.position[0] || p.position[1] - q.position[1]);

  return (
    <div>
      <div className="n8n-scroll" role="group" aria-label={label} tabIndex={0}>
        <div className="n8n-canvas" style={{ width, height }} aria-hidden="true">
          <svg width={width} height={height} className="n8n-edges" focusable="false">
            <defs>
              <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" className="n8n-arrow" />
              </marker>
            </defs>
            {edges.map((e) => (
              <path key={e.key} d={e.d} fill="none" markerEnd={`url(#${arrowId})`} />
            ))}
          </svg>
          {tags.map((t) => (
            <span key={t.key} className="n8n-tag" style={{ left: t.x, top: t.y }}>
              {t.text}
            </span>
          ))}
          {nodes.map((n) => {
            const p = place.get(n.name)!;
            const kind = kindOf(n.type);
            const nodePorts = [...(ports.get(n.name)?.values() ?? [])];
            if (!hasOutgoing.has(n.name)) nodePorts.push({ side: "r", dy: 0 });
            return (
              <div key={n.id} className={`n8n-node n8n-k-${kind.cls}`} style={{ left: p.x, top: p.y, width: S, height: S + LABEL_H }}>
                <div className={`n8n-box${kind.trigger ? " n8n-box-trigger" : ""}`} style={{ width: S, height: S }}>
                  {kind.trigger && (
                    <svg className="n8n-bolt" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path d="M13 3L5 13h6l-1 8 8-10h-6z" />
                    </svg>
                  )}
                  {kind.icon}
                  {nodePorts.map((pt) => (
                    <i key={`${pt.side}${pt.dy}`} className={`n8n-port n8n-port-${pt.side}`} style={{ top: S / 2 + pt.dy - 4 }} />
                  ))}
                </div>
                <span className="n8n-name">{n.name}</span>
                <span className="n8n-kind">{kind.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <ol className="sr-only">
        {ordered.map((n) => (
          <li key={n.id}>{n.name}</li>
        ))}
      </ol>
      <p className="n8n-hint t-caption">{hint}</p>
    </div>
  );
}
