import { useTranslation } from 'react-i18next';

import {
  Callout,
  EtherscanLink,
  Intent,
  Splash,
} from '@vegaprotocol/ui-toolkit';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { ADDRESSES } from '../../../config';
import { useTranches } from '../../../hooks/use-tranches';
import type { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '../../../lib/format-number';
import { TokenDetailsCirculating } from './token-details-circulating';
import { SplashLoader } from '../../../components/splash-loader';

export const TokenDetails = ({
  totalSupply,
  totalStaked,
}: {
  totalSupply: BigNumber;
  totalStaked: BigNumber;
}) => {
  const { t } = useTranslation();

  const { tranches, loading, error } = useTranches();

  if (error) {
    return (
      <Callout intent={Intent.Danger} title={t('errorLoadingTranches')}>
        {error}
      </Callout>
    );
  }

  if (!tranches || loading) {
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
        <EtherscanLink
          data-testid="token-address"
          address={ADDRESSES.vegaTokenAddress}
          text={ADDRESSES.vegaTokenAddress}
          className="font-mono"
        />
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Vesting contract'.toUpperCase())}
        <EtherscanLink
          data-testid="token-contract"
          address={ADDRESSES.vestingAddress}
          text={ADDRESSES.vestingAddress}
          className="font-mono"
        />
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
