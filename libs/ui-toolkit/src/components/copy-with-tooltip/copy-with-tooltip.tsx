import { ReactElement, useEffect, useState } from 'react';
import { Tooltip } from '../tooltip';
import CopyToClipboard from 'react-copy-to-clipboard';

export interface CopyWithTooltipProps {
  children: ReactElement;
  text: string;
}

export function CopyWithTooltip({ children, text }: CopyWithTooltipProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    let timeout: any;

    if (copied) {
      timeout = setTimeout(() => {
        setCopied(false);
      }, 800);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [copied]);

  return (
    <CopyToClipboard text={text} onCopy={() => setCopied(true)}>
      {/* Needs this wrapping div as tooltip component interfers with element used to capture click for copy */}
      <span>
        <Tooltip description="Copied" open={copied} align="center">
          {children}
        </Tooltip>
      </span>
    </CopyToClipboard>
  );
}
