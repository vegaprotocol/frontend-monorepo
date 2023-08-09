import {
  useEnvironment,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { Link, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useMemo } from 'react';
import { ENV } from '../../config/env';
import { Routes } from '../../routes/route-names';
import { Link as RouteLink } from 'react-router-dom';

export const Footer = () => {
  const { VEGA_URL, GIT_COMMIT_HASH, GIT_ORIGIN_URL } = useEnvironment();
  const setNodeSwitcherOpen = useNodeSwitcherStore(
    (store) => store.setDialogOpen
  );

  const { screenSize } = useScreenDimensions();
  const showFullFeedbackLabel = useMemo(
    () => ['md', 'lg', 'xl', 'xxl', 'xxxl'].includes(screenSize),
    [screenSize]
  );

  return (
    <footer className="grid grid-cols-[1fr_auto] items-center text-xs md:text-md lg:flex md:col-span-2 px-4 pt-2 pb-3 gap-4 border-t border-vega-light-200 dark:border-vega-dark-200">
      <div className="flex justify-between gap-2 align-middle">
        {GIT_COMMIT_HASH && (
          <div className="content-center flex border-r border-neutral-700 dark:border-neutral-300 pr-4">
            <p data-testid="git-commit-hash">
              {t('Version')}:{' '}
              <Link
                href={
                  GIT_ORIGIN_URL
                    ? `${GIT_ORIGIN_URL}/commit/${GIT_COMMIT_HASH}`
                    : undefined
                }
                target={GIT_ORIGIN_URL ? '_blank' : undefined}
              >
                {GIT_COMMIT_HASH}
              </Link>
            </p>
          </div>
        )}

        <div className="content-center flex pr-4 md:border-r border-neutral-700 dark:border-neutral-300">
          <span className="pr-2">{VEGA_URL && <NodeUrl url={VEGA_URL} />}</span>
          <Link
            className="ml-2 underline-offset-4"
            onClick={() => setNodeSwitcherOpen(true)}
          >
            {t('Change')}
          </Link>
        </div>

        {ENV.addresses.feedback ? (
          <div className="flex pl-2 content-center">
            <ExternalLink href={ENV.addresses.feedback}>
              {showFullFeedbackLabel ? t('Share your feedback') : t('Feedback')}
            </ExternalLink>
          </div>
        ) : null}
      </div>
      <div className="pl-2 align-center lg:align-right lg:flex lg:justify-end gap-2 align-middle lg:max-w-xs lg:ml-auto">
        <RouteLink
          to={`/${Routes.DISCLAIMER}`}
          className="underline underline-offset-4"
        >
          Disclaimer
        </RouteLink>
      </div>
    </footer>
  );
};

export const NodeUrl = ({ url }: { url: string }) => {
  // get base url from api url, api sub domain
  const urlObj = new URL(url);
  const nodeUrl = urlObj.origin.replace(/^[^.]+\./g, '');
  return <span className="cursor-default">{nodeUrl}</span>;
};
