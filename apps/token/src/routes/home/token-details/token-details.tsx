import { useTranslation } from 'react-i18next';

import { Callout, Link, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { useTranches } from '../../../hooks/use-tranches';
import type { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '../../../lib/format-number';
import { TokenDetailsCirculating } from './token-details-circulating';
import { SplashLoader } from '../../../components/splash-loader';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useContracts } from '../../../contexts/contracts/contracts-context';

export const TokenDetails = ({
  totalSupply,
  totalStaked,
}: {
  totalSupply: BigNumber;
  totalStaked: BigNumber;
}) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();

  const { tranches, loading, error } = useTranches();
  const { config } = useEthereumConfig();
  const { token } = useContracts();

  if (error) {
    return (
      <Callout intent={Intent.Danger} title={t('errorLoadingTranches')}>
        {error}
      </Callout>
    );
  }

  if (!tranches || loading || !config) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  return (
    <KeyValueTable className={'token-details text-white'}>
      <KeyValueTableRow>
        {t('Token address').toUpperCase()}
        <Link
          data-testid="token-address"
          title={t('View on Etherscan (opens in a new tab)')}
          className="font-mono text-white text-right"
          href={`${ETHERSCAN_URL}/address/${token.address}`}
          target="_blank"
        >
          {token.address}
        </Link>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Vesting contract').toUpperCase()}
        <Link
          data-testid="token-contract"
          title={t('View on Etherscan (opens in a new tab)')}
          className="font-mono text-white text-right"
          href={`${ETHERSCAN_URL}/address/${config.token_vesting_contract.address}`}
          target="_blank"
        >
          {config.token_vesting_contract.address}
        </Link>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Total supply').toUpperCase()}
        <span className="font-mono" data-testid="total-supply">
          {formatNumber(totalSupply, 2)}
        </span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Circulating supply').toUpperCase()}
        <TokenDetailsCirculating tranches={tranches} />
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Staked on Vega validator').toUpperCase()}
        <span data-testid="staked" className="font-mono">
          {formatNumber(totalStaked, 2)}
        </span>
      </KeyValueTableRow>
    </KeyValueTable>
  );
};
