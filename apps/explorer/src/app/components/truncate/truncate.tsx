import * as React from 'react';

const ELLIPSIS = '\u2026';

interface TruncateInlineProps {
  text: string | null;
  className?: string;
  style?: React.CSSProperties;
  children?: (truncatedText: string) => React.ReactElement;
  startChars?: number; // number chars to show before ellipsis
  endChars?: number; // number of chars to show after ellipsis
}

/**
 * Truncates a string of text from the center showing a specified number
 * of characters from the start and end. Optionally takes a children as
 * a render props so truncated text can be used inside other elements such
 * as links
 */
export function TruncateInline({
  text,
  className,
  style,
  children,
  startChars,
  endChars,
}: TruncateInlineProps) {
  if (text === null) {
    return <span data-testid="empty-truncation" />;
  }
  const truncatedText = truncateByChars(text, startChars, endChars);

  const wrapperProps = {
    title: text,
    style,
    className,
  };

  if (children !== undefined) {
    return <span {...wrapperProps}>{children(truncatedText)}</span>;
  } else {
    return <span {...wrapperProps}>{truncatedText}</span>;
  }
}

export function truncateByChars(s: string, startChars = 6, endChars = 6) {
  // if the text is shorted than the total number of chars to show
  // no truncation is needed. Plus one is to account for the ellipsis
  if (s.length <= startChars + endChars + 1) {
    return s;
  }

  const start = s.slice(0, startChars);
  const end = s.slice(-endChars);

  return start + ELLIPSIS + end;
}
