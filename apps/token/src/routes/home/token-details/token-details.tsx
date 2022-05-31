import { useTranslation } from 'react-i18next';

import { Callout, Link, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/react-helpers';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { useTranches } from '../../../hooks/use-tranches';
import type { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '../../../lib/format-number';
import { TokenDetailsCirculating } from './token-details-circulating';
import { SplashLoader } from '../../../components/splash-loader';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { EnvironmentConfig } from '@vegaprotocol/smart-contracts';
import type { Networks } from '@vegaprotocol/react-helpers';

const TOKEN_ADDRESS =
  EnvironmentConfig[process.env['NX_VEGA_ENV'] as Networks].vegaTokenAddress;

export const TokenDetails = ({
  totalSupply,
  totalStaked,
}: {
  totalSupply: BigNumber;
  totalStaked: BigNumber;
}) => {
  const { ADDRESSES, ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();

  const { tranches, loading, error } = useTranches();
  const { config } = useEthereumConfig();

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
    <KeyValueTable className={'token-details'}>
      <KeyValueTableRow>
        {t('Token address').toUpperCase()}
        <Link
          data-testid="token-address"
          title={t('View address on Etherscan')}
          className="font-mono"
          href={`${ETHERSCAN_URL}/address/${ADDRESSES.vegaTokenAddress}`}
        >
          {ADDRESSES.vegaTokenAddress}
        </Link>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Vesting contract'.toUpperCase())}
        <Link
          data-testid="token-contract"
          title={t('View address on Etherscan')}
          className="font-mono"
          href={`${ETHERSCAN_URL}/address/${config.token_vesting_contract.address}`}
        >
          {config.token_vesting_contract.address}
        </Link>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Total supply').toUpperCase()}
        <span data-testid="total-supply">{formatNumber(totalSupply, 2)}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Circulating supply').toUpperCase()}
        <TokenDetailsCirculating tranches={tranches} />
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Staked on Vega validator').toUpperCase()}
        <span data-testid="staked">{formatNumber(totalStaked, 2)}</span>
      </KeyValueTableRow>
    </KeyValueTable>
  );
};
