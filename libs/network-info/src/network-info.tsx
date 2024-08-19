import { Fragment } from 'react';
import { t } from '@vegaprotocol/i18n';
import { Link, Lozenge } from '@vegaprotocol/ui-toolkit';
import {
  useEnvironment,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';

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
  } = useEnvironment();

  const setNodeSwitcher = useNodeSwitcherStore((store) => store.setDialogOpen);
  const feedbackLinks = getFeedbackLinks(GITHUB_FEEDBACK_URL);

  return (
    <div data-testid="git-info">
      <p data-testid="git-network-data" className="mb-2">
        {t('Reading network data from')} <Lozenge>{VEGA_URL}</Lozenge>.{' '}
        <Link onClick={() => setNodeSwitcher(true)}>{t('Edit')}</Link>
      </p>
      <p data-testid="git-eth-data" className="mb-2 break-all">
        {t('Reading Ethereum data from')}{' '}
        <Lozenge>{ETHEREUM_PROVIDER_URL}</Lozenge>.{' '}
      </p>
      {GIT_COMMIT_HASH && (
        <p data-testid="git-commit-hash" className="mb-2">
          {t('Version/commit hash')}:{' '}
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
      )}
      {feedbackLinks.length > 0 && (
        <p>
          {t('Known issues and feedback on')}{' '}
          {feedbackLinks.map(({ name, url }, index) => (
            <Fragment key={index}>
              <Link key={index} href={url}>
                {name}
              </Link>
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
