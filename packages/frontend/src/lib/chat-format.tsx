import { Fragment, ReactNode } from "react";

const BULLET = /^(\s*)[*-]\s+/;
const HEADING = /^\s*#{1,6}\s+/;
const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\s][^*\n]*\*)/g;

export function normalizeChatLine(line: string): string {
  if (HEADING.test(line)) return line.replace(HEADING, "");
  return line.replace(BULLET, "$1• ");
}

function renderInline(line: string): ReactNode[] {
  return line
    .split(INLINE)
    .filter(Boolean)
    .map((part, index) => {
      if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return <Fragment key={index}>{part}</Fragment>;
    });
}

export function ChatText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={index}>
          {renderInline(normalizeChatLine(line))}
          {index < lines.length - 1 && "\n"}
        </Fragment>
      ))}
    </>
  );
}
