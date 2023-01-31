import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { BigNumber } from '../../lib/bignumber';
import { formatNumber } from '../../lib/format-number';
import Routes from '../routes';
import { TrancheItem } from './tranche-item';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';

export interface TrancheTableProps {
  tranche: {
    tranche_id: number;
    tranche_start: Date;
    tranche_end: Date;
  };
  locked: BigNumber;
  vested: BigNumber;
  lien: BigNumber;
  totalVested: BigNumber;
  totalLocked: BigNumber;
  onClick: () => void;
  disabled?: boolean;
  address: string | null;
}

export const Tranche0Table = ({
  trancheId,
  total,
}: {
  trancheId: number;
  total: BigNumber;
}) => {
  const { t } = useTranslation();
  return (
    <>
      <KeyValueTable numerical={true}>
        <KeyValueTableRow data-testid="tranche-table-total">
          <span className="inline-block p-4 bg-white text-black uppercase">
            {t('Tranche')} {trancheId}
          </span>

          <span>{formatNumber(total)}</span>
        </KeyValueTableRow>
        <KeyValueTableRow data-testid="tranche-table-locked">
          {t('Locked')}
          <span>{formatNumber(total)}</span>
        </KeyValueTableRow>
      </KeyValueTable>
      <div className="text-right" data-testid="tranche-table-footer">
        {t(
          'All the tokens in this tranche are locked and must be assigned to a tranche before they can be redeemed.'
        )}
      </div>
    </>
  );
};

export const TrancheTable = ({
  tranche,
  locked,
  vested,
  lien,
  onClick,
  totalVested,
  totalLocked,
  disabled = false,
  address,
}: TrancheTableProps) => {
  const { t } = useTranslation();
  const total = vested.plus(locked);
  const { account: connectedAddress } = useWeb3React();
  const trancheFullyLocked =
    tranche.tranche_start.getTime() > new Date().getTime();
  const totalAllTranches = totalVested.plus(totalLocked);
  const unstaked = totalAllTranches.minus(lien);
  const reduceAmount = vested.minus(BigNumber.max(unstaked, 0));
  const redeemable = reduceAmount.isLessThanOrEqualTo(0);

  let message = null;
  if (trancheFullyLocked || vested.isEqualTo(0)) {
    message = (
      <div>
        {t(
          'All the tokens in this tranche are locked and can not be redeemed yet.'
        )}
      </div>
    );
  } else if (!trancheFullyLocked && !redeemable) {
    message = (
      <div>
        <Trans
          i18nKey="You must reduce your associated vesting tokens by at least {{amount}} to redeem from this tranche. <stakeLink>Manage your stake</stakeLink> or just <disassociateLink>dissociate your tokens</disassociateLink>."
          values={{
            amount: reduceAmount,
          }}
          components={{
            stakeLink: <Link to={`/staking`} />,
            disassociateLink: <Link to={`/staking/disassociate`} />,
          }}
        />
      </div>
    );
  } else if (
    !trancheFullyLocked &&
    redeemable &&
    connectedAddress &&
    address === connectedAddress
  ) {
    message = (
      <Button onClick={onClick} disabled={disabled}>
        {t('Redeem unlocked VEGA from tranche {{id}}', {
          id: tranche.tranche_id,
        })}
      </Button>
    );
  }
  return (
    <TrancheItem
      link={`${Routes.SUPPLY}/${tranche.tranche_id}`}
      tranche={tranche}
      locked={locked}
      unlocked={vested}
      total={total}
      message={message}
    />
  );
};
