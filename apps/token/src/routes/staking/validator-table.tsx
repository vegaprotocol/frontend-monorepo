import React from 'react';
import { useTranslation } from 'react-i18next';

import { Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { BigNumber } from '../../lib/bignumber';
import { formatNumber } from '../../lib/format-number';
import type { Staking_nodes } from './__generated__/Staking';

const ValidatorTableCell = ({
  children,
  dataTestId,
}: {
  children: React.ReactNode;
  dataTestId?: string;
}) => (
  <span datatest-id={dataTestId} className="break-words">
    {children}
  </span>
);

export interface ValidatorTableProps {
  node: Staking_nodes;
  stakedTotal: string;
  stakeThisEpoch: BigNumber;
}

export const ValidatorTable = ({
  node,
  stakedTotal,
  stakeThisEpoch,
}: ValidatorTableProps) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();
  const stakePercentage = React.useMemo(() => {
    const total = new BigNumber(stakedTotal);
    const stakedOnNode = new BigNumber(node.stakedTotalFormatted);
    const stakedTotalPercentage =
      total.isEqualTo(0) || stakedOnNode.isEqualTo(0)
        ? '-'
        : stakedOnNode.dividedBy(total).times(100).dp(2).toString() + '%';
    return stakedTotalPercentage;
  }, [node.stakedTotalFormatted, stakedTotal]);

  return (
    <KeyValueTable data-testid="validator-table">
      <KeyValueTableRow>
        <span>{t('id')}:</span>
        <ValidatorTableCell dataTestId="validator-id">
          {node.id}
        </ValidatorTableCell>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span>{t('VEGA ADDRESS / PUBLIC KEY')}</span>
        <ValidatorTableCell dataTestId="validator-public-key">
          {node.pubkey}
        </ValidatorTableCell>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span>{t('ABOUT THIS VALIDATOR')}</span>
        <span>
          <a href={node.infoUrl}>{node.infoUrl}</a>
        </span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span>{t('IP ADDRESS')}</span>
        <span>{node.location}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span>{t('ETHEREUM ADDRESS')}</span>
        <span>
          <Link
            title={t('View on Etherscan (opens in a new tab)')}
            href={`${ETHERSCAN_URL}/address/${node.ethereumAdddress}`}
            target="_blank"
          >
            {node.ethereumAdddress}
          </Link>
        </span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span>{t('TOTAL STAKE')}</span>
        <span data-testid="total-stake">{node.stakedTotalFormatted}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span>{t('PENDING STAKE')}</span>
        <span data-testid="pending-stake">{node.pendingStakeFormatted}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span>{t('STAKED BY OPERATOR')}</span>
        <span data-testid="staked-by-operator">
          {node.stakedByOperatorFormatted}
        </span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span>{t('STAKED BY DELEGATES')}</span>
        <span data-testid="staked-by-delegates">
          {node.stakedByDelegatesFormatted}
        </span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span>{t('STAKE SHARE')}</span>
        <span data-testid="stake-percentage">{stakePercentage}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span>{t('OWN STAKE (THIS EPOCH)')}</span>
        <span data-testid="own-stake">{formatNumber(stakeThisEpoch)}</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span>{t('NOMINATED (THIS EPOCH)')}</span>
        <span data-testid="nominated-stake">
          {node.stakedByDelegatesFormatted}
        </span>
      </KeyValueTableRow>
    </KeyValueTable>
  );
};
