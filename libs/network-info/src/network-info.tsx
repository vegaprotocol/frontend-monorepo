import { t } from '@vegaprotocol/i18n';
import { Link, Lozenge } from '@vegaprotocol/ui-toolkit';
import {
  useEnvironment,
  useNodeSwitcherStore,
} from '@vegaprotocol/environment';

export const NetworkInfo = () => {
  const { API_NODE, GIT_COMMIT_HASH, GIT_ORIGIN_URL, ETHEREUM_PROVIDER_URL } =
    useEnvironment();

  const setNodeSwitcher = useNodeSwitcherStore((store) => store.setDialogOpen);

  return (
    <div data-testid="git-info">
      <p data-testid="git-network-data" className="mb-2">
        {t('Reading network data from')}{' '}
        <Lozenge>{API_NODE?.graphQLApiUrl}</Lozenge>.{' '}
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
    </div>
  );
};
