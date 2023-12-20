import {
  CopyWithTooltip,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';
import { Button } from './buttons';
import { useT } from '../../lib/use-t';
import { Routes } from '../../lib/links';
import { DApp, useLinks } from '@vegaprotocol/environment';
import truncate from 'lodash/truncate';

export const Tile = ({
  className,
  children,
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={classNames(
        'text-black dark:text-white',
        'overflow-hidden relative',
        'p-3 md:p-6',
        'rounded-lg',
        'bg-vega-clight-800 dark:bg-vega-cdark-800',
        className
      )}
    >
      {children}
    </div>
  );
};

type StatTileProps = {
  title: ReactNode;
  testId?: string;
  description?: ReactNode;
  children?: ReactNode;
  overrideWithNoProgram?: boolean;
};
export const StatTile = ({
  title,
  description,
  children,
  testId,
  overrideWithNoProgram = false,
}: StatTileProps) => {
  if (overrideWithNoProgram) {
    return <NoProgramTile title={title} />;
  }
  return (
    <Tile>
      <h3
        data-testid={testId}
        className="mb-1 text-sm text-vega-clight-100 dark:text-vega-cdark-100 calt"
      >
        {title}
      </h3>
      <div
        data-testid={`${testId}-value`}
        className="text-2xl lg:text-5xl text-left"
      >
        {children}
      </div>
      {description && (
        <div className="text-sm text-left text-vega-clight-100 dark:text-vega-cdark-100">
          {description}
        </div>
      )}
    </Tile>
  );
};

export const NoProgramTile = ({ title }: Pick<StatTileProps, 'title'>) => {
  const t = useT();
  return (
    <Tile>
      <h3 className="mb-1 text-sm text-vega-clight-100 dark:text-vega-cdark-100 calt">
        {title}
      </h3>
      <div className="text-xs text-vega-clight-300 dark:text-vega-cdark-300 leading-[3rem]">
        {t('No active program')}
      </div>
    </Tile>
  );
};

const FADE_OUT_STYLE = classNames(
  'after:w-5 after:h-full after:absolute after:top-0 after:right-0',
  'after:bg-gradient-to-l after:from-vega-clight-800 after:dark:from-vega-cdark-800 after:to-transparent'
);

export const CodeTile = ({
  code,
  createdAt,
  className,
}: {
  code: string;
  createdAt?: string;
  className?: string;
}) => {
  const t = useT();
  const consoleLink = useLinks(DApp.Console);
  const applyCodeLink = consoleLink(
    `#${Routes.REFERRALS_APPLY_CODE}?code=${code}`
  );
  return (
    <StatTile
      title={t('Your referral code')}
      description={
        createdAt ? t('(Created at: {{createdAt}})', { createdAt }) : undefined
      }
    >
      <div className="flex items-center justify-between gap-2">
        <Tooltip
          description={
            <div className="break-all">
              <span className="text-xl text-transparent bg-rainbow bg-clip-text">
                {code}
              </span>
            </div>
          }
        >
          <div
            className={classNames(
              'relative bg-rainbow bg-clip-text text-transparent text-2xl lg:text-5xl overflow-hidden',
              FADE_OUT_STYLE
            )}
          >
            {code}
          </div>
        </Tooltip>
        <CopyWithTooltip text={code} description={t('Copy referral code')}>
          <Button className="text-sm no-underline !py-0 !px-0 h-fit !bg-transparent">
            <span className="sr-only">{t('Copy')}</span>
            <VegaIcon size={20} name={VegaIconNames.COPY} />
          </Button>
        </CopyWithTooltip>
        <CopyWithTooltip
          text={applyCodeLink}
          description={
            <>
              {t('Copy shareable apply code link')}
              {': '}
              <a className="text-vega-blue-500 underline" href={applyCodeLink}>
                {truncate(applyCodeLink, { length: 32 })}
              </a>
            </>
          }
        >
          <Button className="text-sm no-underline !py-0 !px-0 h-fit !bg-transparent">
            <span className="sr-only">{t('Copy')}</span>
            <VegaIcon size={20} name={VegaIconNames.OPEN_EXTERNAL} />
          </Button>
        </CopyWithTooltip>
      </div>
    </StatTile>
  );
};
