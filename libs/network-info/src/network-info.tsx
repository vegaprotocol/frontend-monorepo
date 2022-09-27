import { Fragment } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { ExternalLink, Lozenge } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';

const getFeedbackLinks = (gitOriginUrl?: string) =>
  [
    {
      name: 'Github',
      url: gitOriginUrl,
    },
  ].filter((link) => !!link.url);

export const NetworkInfo = () => {
  const {
    VEGA_URL,
    GIT_COMMIT_HASH,
    GIT_ORIGIN_URL,
    GITHUB_FEEDBACK_URL,
    ETHEREUM_PROVIDER_URL,
    setNodeSwitcherOpen,
  } = useEnvironment();
  const feedbackLinks = getFeedbackLinks(GITHUB_FEEDBACK_URL);

  return (
    <div data-testid="git-info">
      <p data-testid="git-network-data" className="mb-2">
        {t('Reading network data from')}{' '}
        <Lozenge className="bg-neutral-300 dark:bg-neutral-700">
          {VEGA_URL}
        </Lozenge>
        .{' '}
        <ExternalLink onClick={() => setNodeSwitcherOpen()}>
          {t('Edit')}
        </ExternalLink>
      </p>
      <p data-testid="git-eth-data" className="mb-2 break-all">
        {t('Reading Ethereum data from')}{' '}
        <Lozenge className="bg-neutral-300 dark:bg-neutral-700">
          {ETHEREUM_PROVIDER_URL}
        </Lozenge>
        .{' '}
      </p>
      {GIT_COMMIT_HASH && (
        <p data-testid="git-commit-hash" className="mb-2">
          {t('Version/commit hash')}:{' '}
          <ExternalLink
            href={
              GIT_ORIGIN_URL
                ? `${GIT_ORIGIN_URL}/commit/${GIT_COMMIT_HASH}`
                : undefined
            }
            target={GIT_ORIGIN_URL ? '_blank' : undefined}
          >
            {GIT_COMMIT_HASH}
          </ExternalLink>
        </p>
      )}
      {feedbackLinks.length > 0 && (
        <p>
          {t('Known issues and feedback on')}{' '}
          {feedbackLinks.map(({ name, url }, index) => (
            <Fragment key={index}>
              <ExternalLink key={index} href={url}>
                {name}
              </ExternalLink>
              {feedbackLinks.length > 1 &&
                index < feedbackLinks.length - 2 &&
                ','}
              {feedbackLinks.length > 1 &&
                index === feedbackLinks.length - 1 &&
                `, ${t('and')} `}
            </Fragment>
          ))}
        </p>
      )}
    </div>
  );
};
