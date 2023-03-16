import { NodeSwitcherDialog, useEnvironment } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { ExternalLink, Link } from '@vegaprotocol/ui-toolkit';
import { useMemo, useState } from 'react';
import { ENV } from '../../config/env';

export const Footer = () => {
  const { VEGA_URL, GIT_COMMIT_HASH, GIT_ORIGIN_URL } = useEnvironment();
  const [nodeSwitcherOpen, setNodeSwitcherOpen] = useState(false);
  const { screenSize } = useScreenDimensions();
  const showFullFeedbackLabel = useMemo(
    () => ['lg', 'xl', 'xxl', 'xxxl'].includes(screenSize),
    [screenSize]
  );

  return (
    <>
      <footer className="grid grid-rows-2 grid-cols-[1fr_auto] text-xs md:text-md md:flex md:col-span-2 px-4 py-2 gap-4 border-t border-vega-light-200 dark:border-vega-dark-200">
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

          <div className="content-center flex pl-2 md:border-r border-neutral-700 dark:border-neutral-300 pr-4">
            {VEGA_URL && <NodeUrl url={VEGA_URL} />}
            <Link className="ml-2" onClick={() => setNodeSwitcherOpen(true)}>
              {t('Change')}
            </Link>
          </div>

          <div className="flex pl-2 content-center">
            <ExternalLink href={ENV.addresses.feedback}>
              {showFullFeedbackLabel ? t('Share your feedback') : t('Feedback')}
            </ExternalLink>
          </div>
        </div>
      </footer>
      <NodeSwitcherDialog
        open={nodeSwitcherOpen}
        setOpen={setNodeSwitcherOpen}
      />
    </>
  );
};

const NodeUrl = ({ url }: { url: string }) => {
  // get base url from api url, api sub domain
  const urlObj = new URL(url);
  const nodeUrl = urlObj.origin.replace(/^[^.]+\./g, '');
  return (
    <Link href={'https://' + nodeUrl} target="_blank">
      {nodeUrl}
    </Link>
  );
};
