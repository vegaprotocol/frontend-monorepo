import { useOutletContext } from 'react-router-dom';
import type { Tranche } from '@vegaprotocol/smart-contracts';
import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { TrancheItem } from '../redemption/tranche-item';
import { TrancheLabel } from './tranche-label';
import { VestingChart } from './vesting-chart';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useEthereumConfig } from '@vegaprotocol/web3';

const trancheMinimum = 10;

const shouldShowTranche = (t: Tranche) =>
  !t.total_added.isLessThanOrEqualTo(trancheMinimum);

export const Tranches = () => {
  const tranches = useOutletContext<Tranche[]>();
  const [showAll, setShowAll] = React.useState<boolean>(false);
  const { t } = useTranslation();
  const { chainId } = useWeb3React();
  const { config } = useEthereumConfig();
  const filteredTranches = tranches?.filter(shouldShowTranche) || [];

  if (!config) {
    return null;
  }

  return (
    <section>
      <h2>{t('chartTitle')}</h2>
      <p>{t('chartAbove')}</p>
      <VestingChart />
      <p>{t('chartBelow')}</p>
      {tranches?.length ? (
        <ul role="list">
          {(showAll ? tranches : filteredTranches).map((tranche) => {
            return (
              <React.Fragment key={tranche.tranche_id}>
                <TrancheItem
                  link={`${tranche.tranche_id}`}
                  tranche={tranche}
                  locked={tranche.locked_amount}
                  unlocked={tranche.total_added.minus(tranche.locked_amount)}
                  total={tranche.total_added}
                  secondaryHeader={
                    <TrancheLabel chainId={chainId} id={tranche.tranche_id} />
                  }
                />
              </React.Fragment>
            );
          })}
        </ul>
      ) : (
        <p>{t('No tranches')}</p>
      )}
      <section className="text-center mt-32">
        <Button variant="inline-link" onClick={() => setShowAll(!showAll)}>
          {showAll
            ? t(
                'Showing tranches with <{{trancheMinimum}} VEGA, click to hide these tranches',
                { trancheMinimum }
              )
            : t(
                'Not showing tranches with <{{trancheMinimum}} VEGA, click to show all tranches',
                { trancheMinimum }
              )}
        </Button>
      </section>
    </section>
  );
};
