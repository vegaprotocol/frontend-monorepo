import type { ReactElement, ReactNode } from 'react';
import { Tooltip } from '../tooltip';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useCopyTimeout } from '@vegaprotocol/react-helpers';
import { useT } from '../../use-t';

export const TOOLTIP_TIMEOUT = 800;

export interface CopyWithTooltipProps {
  children: ReactElement;
  text: string;
  /**
   * The tooltip's description to be shown on mouse over
   * (replaced by "Copied" when clicked on)
   */
  description?: ReactNode;
}

export function CopyWithTooltip({
  children,
  text,
  description,
}: CopyWithTooltipProps) {
  const t = useT();
  const [copied, setCopied] = useCopyTimeout();

  const copiedDescription = t('Copied');

  return (
    <CopyToClipboard text={text} onCopy={() => setCopied(true)}>
      {/*
      // @ts-ignore not sure about this typescript error. Needs this wrapping span as tooltip component interferes with element used to capture click for copy */}
      <span>
        <Tooltip
          description={copied ? copiedDescription : description}
          open={description ? copied || undefined : copied}
          align="center"
        >
          {children}
        </Tooltip>
      </span>
    </CopyToClipboard>
  );
}
