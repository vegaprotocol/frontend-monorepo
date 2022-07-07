import { t } from '@vegaprotocol/react-helpers';
import { Link, Lozenge } from '@vegaprotocol/ui-toolkit';
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
    <div>
      <p className="mb-16">
        {t('Reading network data from')}{' '}
        <Lozenge className="text-black dark:text-white bg-white-60 dark:bg-black-60">
          {VEGA_URL}
        </Lozenge>
        . <Link onClick={() => setNodeSwitcherOpen()}>{t('Edit')}</Link>
      </p>
      <p className="mb-[1rem]">
        {t('Reading Ethereum data from')}{' '}
        <Lozenge className="text-black dark:text-white bg-white-60 dark:bg-black-60">
          {ETHEREUM_PROVIDER_URL}
        </Lozenge>
        .{' '}
      </p>
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
  );
};
