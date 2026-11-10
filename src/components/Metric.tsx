export function Metric({
  value,
  label,
  size = "lg",
}: {
  value: string;
  label?: string;
  size?: "lg" | "sm";
}) {
  return (
    <div>
      <p className={size === "lg" ? "t-metric" : "t-metric t-metric-sm"}>{value}</p>
      {label && <p className="t-caption mt-3 max-w-[28ch]">{label}</p>}
    </div>
  );
}
