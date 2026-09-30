import { Link } from "@tanstack/react-router";
import { inlineAssistantLinks } from "@/lib/assistant-links";
import { Fragment } from "react";

// A deliberately small Markdown subset for assistant prose. React escapes every
// text node; model output is never interpreted as HTML or executable links.
function LinkedText({ text, university }: { text: string; university?: string }) {
  return inlineAssistantLinks(text, university).map((part, i) =>
    !part.url ? (
      <Fragment key={i}>{part.text}</Fragment>
    ) : part.external ? (
      <a
        key={i}
        href={part.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:decoration-2"
      >
        {part.text}
      </a>
    ) : (
      <Link
        key={i}
        to={part.url}
        className="text-primary underline underline-offset-2 hover:decoration-2"
      >
        {part.text}
      </Link>
    ),
  );
}
function InlineText({ text, university }: { text: string; university?: string }) {
  const parts = text.split(/(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`)/g);
  return parts.map((part, index) => {
    if (
      (part.startsWith("**") && part.endsWith("**")) ||
      (part.startsWith("__") && part.endsWith("__"))
    )
      return (
        <strong key={index} className="font-semibold">
          <LinkedText text={part.slice(2, -2)} university={university} />
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
      return (
        <code key={index} className="rounded bg-muted px-1 text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    return <LinkedText key={index} text={part} university={university} />;
  });
}

type Block = { kind: "paragraph" | "ul" | "ol"; lines: string[]; start?: number };
export function AssistantText({ text, university }: { text: string; university?: string }) {
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
            <InlineText university={university} text={block.lines.join("\n")} />
          </p>
        ) : block.kind === "ul" ? (
          <ul key={index} className="list-disc space-y-1 pl-5">
            {block.lines.map((line, i) => (
              <li key={i}>
                <InlineText university={university} text={line} />
              </li>
            ))}
          </ul>
        ) : (
          <ol key={index} start={block.start} className="list-decimal space-y-1 pl-5">
            {block.lines.map((line, i) => (
              <li key={i}>
                <InlineText university={university} text={line} />
              </li>
            ))}
          </ol>
        ),
      )}
    </div>
  );
}
