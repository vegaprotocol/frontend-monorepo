import { truncateByChars } from '@vegaprotocol/react-helpers';
import * as React from 'react';

interface TruncateInlineProps {
  text: string | null;
  className?: string;
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
  children,
  startChars,
  endChars,
  ...props
}: TruncateInlineProps) {
  if (text === null) {
    return <span data-testid="empty-truncation" />;
  }
  const truncatedText = truncateByChars(text, startChars, endChars);

  const wrapperProps = {
    title: text,
    className,
    ...props,
  };

  if (children !== undefined) {
    return <span {...wrapperProps}>{children(truncatedText)}</span>;
  } else {
    return <span {...wrapperProps}>{truncatedText}</span>;
  }
}
