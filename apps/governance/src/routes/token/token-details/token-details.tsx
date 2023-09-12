import { useTranslation } from 'react-i18next';

import { Callout, Link, Intent, Splash } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { useTranches } from '../../../lib/tranches/tranches-store';
import type { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '../../../lib/format-number';
import { TokenDetailsCirculating } from './token-details-circulating';
import { SplashLoader } from '../../../components/splash-loader';
import { useEthereumConfig } from '@vegaprotocol/web3';
import { useContracts } from '../../../contexts/contracts/contracts-context';
import { ENV } from '../../../config';

export const TokenDetails = ({
  totalSupply,
  totalAssociated,
}: {
  totalSupply: BigNumber;
  totalAssociated: BigNumber;
}) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();

  const { tranches, loading, error } = useTranches((state) => ({
    loading: state.loading,
    error: state.error,
    tranches: state.tranches,
  }));
  const { config } = useEthereumConfig();
  const { token } = useContracts();

  if (error) {
    return (
      <Callout intent={Intent.Danger} title={t('errorLoadingTranches')}>
        {error.message}
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

  const tokenVestingContractAddress =
    config.token_vesting_contract?.address || ENV.addresses.tokenVestingAddress;

  return (
    <div className="token-details break-all">
      <RoundedWrapper>
        <KeyValueTable>
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
          {tokenVestingContractAddress && (
            <KeyValueTableRow>
              {t('Vesting contract').toUpperCase()}
              <Link
                data-testid="token-contract"
                title={t('View on Etherscan (opens in a new tab)')}
                className="font-mono text-white text-right"
                href={`${ETHERSCAN_URL}/address/${tokenVestingContractAddress}`}
                target="_blank"
              >
                {tokenVestingContractAddress}
              </Link>
            </KeyValueTableRow>
          )}
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
          <KeyValueTableRow noBorder={true}>
            {t('Staked on Vega validator').toUpperCase()}
            <span data-testid="staked" className="font-mono">
              {formatNumber(totalAssociated, 2)}
            </span>
          </KeyValueTableRow>
        </KeyValueTable>
      </RoundedWrapper>
    </div>
  );
};
