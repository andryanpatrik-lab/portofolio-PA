export function Footer({ text }: { text: string }) {
  return (
    <footer className="container-page border-t border-border py-10">
      <p className="t-caption">{text}</p>
    </footer>
  );
}
