export function Eyebrow({ children, dust = false }: { children: React.ReactNode; dust?: boolean }) {
  return (
    <p {...(dust ? { "data-dust": "assemble", "data-dust-state": "pending" } : {})} className="t-label text-text-muted">
      {children}
    </p>
  );
}
