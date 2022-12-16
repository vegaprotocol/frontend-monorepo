import type { Tranche as ITranche } from '@vegaprotocol/smart-contracts';
import { Link } from '@vegaprotocol/ui-toolkit';
import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Navigate } from 'react-router-dom';

import { useOutletContext } from 'react-router-dom';
import { useEnvironment } from '@vegaprotocol/environment';
import { BigNumber } from '../../lib/bignumber';
import { formatNumber } from '../../lib/format-number';
import { TrancheItem } from '../redemption/tranche-item';
import Routes from '../routes';
import { TrancheLabel } from './tranche-label';

const TrancheProgressContents = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="flex justify-between gap-4 font-mono py-2 px-4">
    {children}
  </div>
);

export const Tranche = () => {
  const tranches = useOutletContext<ITranche[]>();
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();
  const { trancheId } = useParams<{ trancheId: string }>();
  const { chainId } = useWeb3React();
  const tranche = tranches.find(
    (tranche) => trancheId && parseInt(trancheId) === tranche.tranche_id
  );

  const lockedData = React.useMemo(() => {
    if (!tranche) return null;
    const locked = tranche.locked_amount.div(tranche.total_added);
    return {
      locked,
      unlocked: new BigNumber(1).minus(locked),
    };
  }, [tranche]);

  if (!tranche) {
    return <Navigate to={Routes.NOT_FOUND} />;
  }

  return (
    <>
      <TrancheItem
        tranche={tranche}
        locked={tranche.locked_amount}
        unlocked={tranche.total_added.minus(tranche.locked_amount)}
        total={tranche.total_added}
        secondaryHeader={
          <TrancheLabel chainId={chainId} id={tranche.tranche_id} />
        }
      />
      <div
        className="flex justify-between gap-x-4 py-2 px-4"
        data-testid="redeemed-tranche-tokens"
      >
        <span>{t('alreadyRedeemed')}</span>
        <span className="font-mono">{formatNumber(tranche.total_removed)}</span>
      </div>
      <h2>{t('Holders')}</h2>
      {tranche.users.length ? (
        <ul role="list">
          {tranche.users.map((user, i) => {
            const unlocked = user.remaining_tokens.times(
              lockedData?.unlocked || 0
            );
            const locked = user.remaining_tokens.times(lockedData?.locked || 0);
            return (
              <li className="pb-4" key={i}>
                <Link
                  title={t('View on Etherscan (opens in a new tab)')}
                  href={`${ETHERSCAN_URL}/tx/${user.address}`}
                  target="_blank"
                >
                  {user.address}
                </Link>
                <TrancheProgressContents>
                  <span>{t('Locked')}</span>
                  <span>{t('Unlocked')}</span>
                </TrancheProgressContents>
                <TrancheProgressContents>
                  <span>{formatNumber(locked)}</span>
                  <span>{formatNumber(unlocked)}</span>
                </TrancheProgressContents>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>{t('No users')}</p>
      )}
    </>
  );
};

export default Tranche;
