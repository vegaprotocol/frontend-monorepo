import './token-details.scss';

import { useTranslation } from 'react-i18next';

import { EtherscanLink } from '@vegaprotocol/ui-toolkit';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { ADDRESSES } from '../../../config';
import { useTranches } from '../../../hooks/use-tranches';
import type { BigNumber } from '../../../lib/bignumber';
import { formatNumber } from '../../../lib/format-number';
import { TokenDetailsCirculating } from './token-details-circulating';

export const TokenDetails = ({
  totalSupply,
  totalStaked,
}: {
  totalSupply: BigNumber;
  totalStaked: BigNumber;
}) => {
  const { t } = useTranslation();

  const { tranches } = useTranches();
  return (
    <KeyValueTable className={'token-details'}>
      <KeyValueTableRow>
        {t('Token address')}
        <EtherscanLink
          data-testid="token-address"
          address={ADDRESSES.vegaTokenAddress}
          text={ADDRESSES.vegaTokenAddress}
          className="font-mono"
        />
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Vesting contract')}
        <EtherscanLink
          data-testid="token-contract"
          address={ADDRESSES.vestingAddress}
          text={ADDRESSES.vestingAddress}
          className="font-mono"
        />
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Total supply')}
        <span data-testid="total-supply">{formatNumber(totalSupply, 2)}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Circulating supply')}
        <TokenDetailsCirculating tranches={tranches} />
      </KeyValueTableRow>
      <KeyValueTableRow>
        {t('Staked on Vega validator')}
        <span data-testid="staked">{formatNumber(totalStaked, 2)}</span>
      </KeyValueTableRow>
    </KeyValueTable>
  );
};
