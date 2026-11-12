import type { Skeleton } from "@/lib/n8nSkeletons";

// Layout constants: positions come from the real workflow, scaled down a little so boxes stay readable.
const SCALE = 0.85;
const W = 164;
const H = 64;
const PAD = 24;

const KIND: Record<string, { label: string; trigger?: boolean }> = {
  scheduleTrigger: { label: "Schedule", trigger: true },
  webhook: { label: "Webhook", trigger: true },
  errorTrigger: { label: "Error Trigger", trigger: true },
  code: { label: "Code" },
  httpRequest: { label: "HTTP" },
  postgres: { label: "Database" },
  if: { label: "IF" },
  respondToWebhook: { label: "Respond" },
};

/**
 * Static, script-free imitation of an n8n canvas. Draws boxes at the real node positions and joins them with curves.
 * No animation. The wrapper scrolls sideways and is focusable so keyboard users can move through wide workflows.
 */
export function N8nCanvas({ data, label, hint }: { data: Skeleton; label: string; hint: string }) {
  const nodes = data.nodes.filter((n) => n.type !== "n8n-nodes-base.stickyNote");
  const minX = Math.min(...nodes.map((n) => n.position[0]));
  const minY = Math.min(...nodes.map((n) => n.position[1]));
  const maxX = Math.max(...nodes.map((n) => n.position[0]));
  const maxY = Math.max(...nodes.map((n) => n.position[1]));
  const width = Math.round((maxX - minX) * SCALE + W + PAD * 2);
  const height = Math.round((maxY - minY) * SCALE + H + PAD * 2);
  const place = new Map(
    nodes.map((n) => [n.name, { x: Math.round((n.position[0] - minX) * SCALE + PAD), y: Math.round((n.position[1] - minY) * SCALE + PAD) }]),
  );

  const edges: { d: string; key: string }[] = [];
  for (const [from, v] of Object.entries(data.connections)) {
    const a = place.get(from);
    if (!a) continue;
    v.main.forEach((outs, outIndex) => {
      // a node with two outputs (IF) leaves from slightly above and below the middle
      const dy = v.main.length > 1 ? (outIndex === 0 ? -8 : 8) : 0;
      for (const c of outs) {
        const b = place.get(c.node);
        if (!b) continue;
        const x1 = a.x + W;
        const y1 = a.y + H / 2 + dy;
        const x2 = b.x;
        const y2 = b.y + H / 2;
        const dx = Math.max(36, Math.abs(x2 - x1) / 2);
        edges.push({ key: `${from}>${c.node}>${outIndex}`, d: `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}` });
      }
    });
  }

  const ordered = [...nodes].sort((p, q) => p.position[0] - q.position[0] || p.position[1] - q.position[1]);

  return (
    <div>
      <div className="n8n-scroll" role="group" aria-label={label} tabIndex={0}>
        <div className="n8n-canvas" style={{ width, height }} aria-hidden="true">
          <svg width={width} height={height} className="n8n-edges" focusable="false">
            {edges.map((e) => (
              <path key={e.key} d={e.d} fill="none" />
            ))}
          </svg>
          {nodes.map((n) => {
            const p = place.get(n.name)!;
            const kind = KIND[n.type.split(".").pop() ?? ""] ?? { label: "Node" };
            return (
              <div key={n.id} className={`n8n-node${kind.trigger ? " n8n-node-trigger" : ""}`} style={{ left: p.x, top: p.y, width: W, height: H }}>
                <span className="n8n-kind t-label">{kind.label}</span>
                <span className="n8n-name">{n.name}</span>
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
