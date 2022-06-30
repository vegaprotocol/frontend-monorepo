import { useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { Link, Lozenge } from '@vegaprotocol/ui-toolkit';
import {
  useEnvironment,
  NetworkSwitcherDialog,
} from '@vegaprotocol/environment';

const getFeedbackLinks = (gitOriginUrl?: string) =>
  [
    {
      name: 'Github',
      url: gitOriginUrl,
    },
  ].filter((link) => !!link.url);

export const Footer = () => {
  const [isNetworkConfigOpen, setNetworkConfigOpen] = useState(false);
  const {
    VEGA_URL,
    VEGA_NETWORKS,
    GIT_COMMIT_HASH,
    GIT_ORIGIN_URL,
    GITHUB_FEEDBACK_URL,
    ETHEREUM_PROVIDER_URL,
  } = useEnvironment();
  const feedbackLinks = getFeedbackLinks(GITHUB_FEEDBACK_URL);

  return (
    <>
      <footer className="grid grid-rows-2 grid-cols-[1fr_auto] md:flex md:col-span-2 p-16 gap-12 border-t-1">
        <div>
          {GIT_COMMIT_HASH && GIT_ORIGIN_URL && (
            <p className="mb-[1rem]">
              {t('Version/commit hash')}:{' '}
              <Link
                href={`${GIT_ORIGIN_URL}/commit/${GIT_COMMIT_HASH}`}
                target="_blank"
              >
                {GIT_COMMIT_HASH}
              </Link>
            </p>
          )}
          <p className="mb-[1rem]">
            {t('Reading network data from')}{' '}
            <Lozenge className="bg-white-80 dark:bg-black-80">
              {VEGA_URL}
            </Lozenge>
            .{' '}
            <Link onClick={() => setNetworkConfigOpen(true)}>{t('Edit')}</Link>
          </p>
          <p className="mb-[1rem]">
            {t('Reading Ethereum data from')}{' '}
            <Lozenge className="bg-white-80 dark:bg-black-80">
              {ETHEREUM_PROVIDER_URL}
            </Lozenge>
            .{' '}
          </p>
          {feedbackLinks.length > 0 && (
            <p className="mb-16">
              {t('Known issues and feedback on')}{' '}
              {feedbackLinks.map(({ name, url }, index) => (
                <>
                  <Link key={index} href={url}>
                    {name}
                  </Link>
                  {feedbackLinks.length > 1 &&
                    index < feedbackLinks.length - 2 &&
                    ','}
                  {feedbackLinks.length > 1 &&
                    index === feedbackLinks.length - 1 &&
                    `, ${t('and')} `}
                </>
              ))}
            </p>
          )}
        </div>
      </footer>
      <NetworkSwitcherDialog
        dialogOpen={isNetworkConfigOpen}
        setDialogOpen={setNetworkConfigOpen}
        onConnect={({ network }) => {
          if (VEGA_NETWORKS[network]) {
            window.location.href = VEGA_NETWORKS[network] as string;
          }
        }}
      />
    </>
  );
};
