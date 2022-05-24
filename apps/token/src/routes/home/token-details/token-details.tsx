import { useTranslation } from 'react-i18next';

import { Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/react-helpers';
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
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();

  const { tranches } = useTranches();
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
          href={`${ETHERSCAN_URL}/address/${ADDRESSES.vestingAddress}`}
        >
          {ADDRESSES.vestingAddress}
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
