import type { ReactElement } from 'react';
import { Tooltip } from '../tooltip';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';

export const TOOLTIP_TIMEOUT = 800;

export interface CopyWithTooltipProps {
  children: ReactElement;
  text: string;
}

export function CopyWithTooltip({ children, text }: CopyWithTooltipProps) {
  const [copied, setCopied] = useCopyTimeout();

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
