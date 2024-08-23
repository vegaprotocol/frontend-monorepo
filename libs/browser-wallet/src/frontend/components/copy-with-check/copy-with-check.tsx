import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
// @ts-ignore
import CopyToClipboard from 'react-copy-to-clipboard';

import { Copy } from '../icons/copy';
import { Tick } from '../icons/tick';
import locators from '../locators';

interface CopyWithCheckmarkProperties {
  children?: ReactNode;
  text: string;
  iconSide?: 'left' | 'right';
}

export function CopyWithCheckmark({
  text,
  children,
  iconSide = 'right',
}: Readonly<CopyWithCheckmarkProperties>) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (copied) {
      timeout = setTimeout(() => {
        setCopied(false);
      }, 800);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [copied]);

  const content =
    iconSide === 'right' ? (
      <>
        {children}&nbsp;
        {copied ? (
          <Tick size={16} className="text-intent-success" />
        ) : (
          <Copy className="w-4" />
        )}
      </>
    ) : (
      <>
        {copied ? (
          <Tick size={16} className="text-intent-success" />
        ) : (
          <Copy className="w-4" />
        )}
        <span className="ml-3">{children}</span>
      </>
    );

  return (
    <CopyToClipboard text={text} onCopy={() => setCopied(true)}>
      <button data-testid={locators.copyWithCheck} className="cursor-pointer">
        {content}
      </button>
    </CopyToClipboard>
  );
}
