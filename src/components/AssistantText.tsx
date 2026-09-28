import { Fragment } from "react";

// A deliberately small Markdown subset for assistant prose. React escapes every
// text node; model output is never interpreted as HTML or executable links.
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`)/g);
  return parts.map((part, index) => {
    if (
      (part.startsWith("**") && part.endsWith("**")) ||
      (part.startsWith("__") && part.endsWith("__"))
    )
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
      return (
        <code key={index} className="rounded bg-muted px-1 text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    return <Fragment key={index}>{part}</Fragment>;
  });
}

type Block = { kind: "paragraph" | "ul" | "ol"; lines: string[]; start?: number };
export function AssistantText({ text }: { text: string }) {
  const blocks: Block[] = [];
  let active: Block | undefined;
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (!line.trim()) {
      active = undefined;
      continue;
    }
    const bullet = line.match(/^\s*[-*+•]\s+(.+)$/);
    const number = line.match(/^\s*(\d+)[.)]\s+(.+)$/);
    const kind = bullet ? "ul" : number ? "ol" : "paragraph";
    if (!active || active.kind !== kind) {
      active = { kind, lines: [], ...(number ? { start: Number(number[1]) } : {}) };
      blocks.push(active);
    }
    active.lines.push(bullet?.[1] ?? number?.[2] ?? line);
  }
  return (
    <div className="space-y-3 break-words leading-7">
      {blocks.map((block, index) =>
        block.kind === "paragraph" ? (
          <p key={index} className="whitespace-pre-wrap">
            <InlineText text={block.lines.join("\n")} />
          </p>
        ) : block.kind === "ul" ? (
          <ul key={index} className="list-disc space-y-1 pl-5">
            {block.lines.map((line, i) => (
              <li key={i}>
                <InlineText text={line} />
              </li>
            ))}
          </ul>
        ) : (
          <ol key={index} start={block.start} className="list-decimal space-y-1 pl-5">
            {block.lines.map((line, i) => (
              <li key={i}>
                <InlineText text={line} />
              </li>
            ))}
          </ol>
        ),
      )}
    </div>
  );
}
