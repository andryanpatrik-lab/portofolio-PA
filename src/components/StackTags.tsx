export function StackTags({ items, label }: { items: string[]; label?: string }) {
  return (
    <ul aria-label={label} className="t-label flex flex-wrap gap-x-4 gap-y-2 text-text-2">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
