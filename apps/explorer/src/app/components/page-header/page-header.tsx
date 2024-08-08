import React from 'react';
import type { ReactNode } from 'react';
import { TruncateInline } from '../truncate/truncate';
import { CopyWithTooltip, Icon } from '@vegaprotocol/ui-toolkit';

interface PageHeaderProps {
  title: string;
  truncateStart?: number;
  truncateEnd?: number;
  copy?: boolean;
  prefix?: string | ReactNode;
  className?: string;
}

export const PageHeader = ({
  prefix,
  title,
  truncateStart,
  truncateEnd,
  copy = false,
  className,
}: PageHeaderProps) => {
  const titleClasses = 'text-xl uppercase font-alpha calt';
  return (
    <header className={className}>
      <span className={`${titleClasses} block`}>{prefix}</span>
      <div className="flex items-center gap-x-4">
        <h2 className={titleClasses}>
          {truncateStart && truncateEnd ? (
            <TruncateInline
              text={title}
              startChars={truncateStart}
              endChars={truncateEnd}
            />
          ) : (
            title
          )}
        </h2>
        {copy && (
          <CopyWithTooltip data-testid="copy-to-clipboard" text={title}>
            <button className="bg-gs-100 rounded-sm py-2 px-3">
              <Icon name="duplicate" className="" />
            </button>
          </CopyWithTooltip>
        )}
      </div>
    </header>
  );
};
