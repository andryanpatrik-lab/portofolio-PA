import { StackTags } from "./StackTags";

export function OtherProjectCard({
  name,
  summary,
  tags,
  status,
}: {
  name: string;
  summary: string;
  tags: string[];
  status?: string | null;
}) {
  return (
    <article className="other-card flex h-full flex-col rounded-xl border border-border bg-bg p-6">
      <h3 className="t-h4">{name}</h3>
      <p className="mt-3 text-text-2">{summary}</p>
      <div className="mt-auto pt-6">
        <StackTags items={tags} />
        {status && <p className="t-caption mt-3">{status}</p>}
      </div>
    </article>
  );
}
