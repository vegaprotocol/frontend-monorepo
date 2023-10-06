import {
  CopyWithTooltip,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';
import { Button } from './buttons';

export const Tile = ({
  className,
  children,
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={classNames(
        'rounded-lg overflow-hidden relative',
        'bg-vega-clight-800 dark:bg-vega-cdark-800 text-black dark:text-white',
        'p-6',
        className
      )}
    >
      {children}
    </div>
  );
};

type StatTileProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};
export const StatTile = ({ title, description, children }: StatTileProps) => {
  return (
    <Tile>
      <h3 className="mb-1 text-sm text-vega-clight-100 dark:text-vega-cdark-100 calt">
        {title}
      </h3>
      <div className="text-5xl text-left">{children}</div>
      {description && (
        <div className="text-sm text-left text-vega-clight-100 dark:text-vega-cdark-100">
          {description}
        </div>
      )}
    </Tile>
  );
};

const FADE_OUT_STYLE = classNames(
  'after:w-5 after:h-full after:absolute after:top-0 after:right-0',
  'after:bg-gradient-to-l after:from-vega-clight-800 after:dark:from-vega-cdark-800 after:to-transparent'
);

export const CodeTile = ({ code }: { code: string }) => {
  return (
    <StatTile title="Your referral code">
      <div className="flex gap-2 items-center justify-between">
        <Tooltip
          description={
            <div className="break-all">
              <span className="text-xl bg-rainbow bg-clip-text text-transparent">
                {code}
              </span>
            </div>
          }
        >
          <div
            className={classNames(
              'relative bg-rainbow bg-clip-text text-transparent text-5xl overflow-hidden',
              FADE_OUT_STYLE
            )}
          >
            {code}
          </div>
        </Tooltip>
        <CopyWithTooltip text={code}>
          <Button className="text-sm no-underline !py-0 !px-0 h-fit !bg-transparent">
            <span className="sr-only">Copy</span>
            <VegaIcon size={24} name={VegaIconNames.COPY} />
          </Button>
        </CopyWithTooltip>
      </div>
    </StatTile>
  );
};
