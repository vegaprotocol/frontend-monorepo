import { useWeb3React } from '@web3-react/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SubHeading } from '../../components/heading';
import { TrancheItem } from '../redemption/tranche-item';
import { TrancheLabel } from './tranche-label';
import { VestingChart } from './vesting-chart';
import { ButtonLink } from '@vegaprotocol/ui-toolkit';
import { useEthereumConfig } from '@vegaprotocol/web3';
import type { Tranche } from '../../lib/tranches/tranches-store';
import { useTranches } from '../../lib/tranches/tranches-store';

const trancheMinimum = 10;

const shouldShowTranche = (t: Tranche) =>
  !t.total_added.isLessThanOrEqualTo(trancheMinimum);

export const Tranches = () => {
  const tranches = useTranches((state) => state.tranches);
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
      <SubHeading title={t('chartTitle')} />
      <p>{t('chartAbove')}</p>
      <VestingChart />
      <p>{t('chartBelow')}</p>
      {tranches?.length ? (
        <ul role="list">
          {(showAll ? tranches : filteredTranches).map((tranche) => {
            return (
              <TrancheItem
                key={tranche.tranche_id}
                link={`${tranche.tranche_id}`}
                tranche={tranche}
                locked={tranche.locked_amount}
                unlocked={tranche.total_added.minus(tranche.locked_amount)}
                total={tranche.total_added}
                secondaryHeader={
                  <TrancheLabel chainId={chainId} id={tranche.tranche_id} />
                }
              />
            );
          })}
        </ul>
      ) : (
        <p>{t('No tranches')}</p>
      )}
      <section className="text-center mt-4">
        <ButtonLink onClick={() => setShowAll(!showAll)}>
          {showAll
            ? t(
                'Showing tranches with <{{trancheMinimum}} VEGA, click to hide these tranches',
                { trancheMinimum }
              )
            : t(
                'Not showing tranches with <{{trancheMinimum}} VEGA, click to show all tranches',
                { trancheMinimum }
              )}
        </ButtonLink>
      </section>
    </section>
  );
};

export default Tranches;
