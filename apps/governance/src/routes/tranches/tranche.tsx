import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { Link as RouterLink } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Navigate } from 'react-router-dom';
import { formatNumber } from '@vegaprotocol/utils';

import { EtherscanLink } from '@vegaprotocol/environment';
import { TrancheItem } from '../redemption/tranche-item';
import Routes from '../routes';
import { TrancheLabel } from './tranche-label';
import { useTranches } from '../../lib/tranches/tranches-store';

type Params = { trancheId: string; address: string };

export const Tranche = () => {
  const tranches = useTranches((state) => state.tranches);
  const { t } = useTranslation();
  const { trancheId } = useParams<Params>();
  const { chainId } = useWeb3React();
  const tranche = tranches?.find(
    (tranche) => trancheId && parseInt(trancheId) === tranche.tranche_id
  );

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
        className="flex justify-between gap-x-4 px-4 py-2"
        data-testid="redeemed-tranche-tokens"
      >
        <span>{t('alreadyRedeemed')}</span>
        <span className="font-mono">{formatNumber(tranche.total_removed)}</span>
      </div>
      <h2>{t('Holders')}</h2>
      {tranche.users.length ? (
        <RoundedWrapper>
          <KeyValueTable>
            <KeyValueTableRow>
              <h1>{t('Ethereum Address')}</h1>
              <h1>{t('View tranche data')}</h1>
            </KeyValueTableRow>
            {tranche.users.map((user) => (
              <KeyValueTableRow key={user}>
                <EtherscanLink address={user} data-testid="link" />
                <RouterLink
                  className="underline"
                  title={t('View vesting information')}
                  to={`${Routes.REDEEM}/${user}`}
                  data-testid="redeem-link"
                >
                  {t('View vesting information')}
                </RouterLink>
              </KeyValueTableRow>
            ))}
          </KeyValueTable>
        </RoundedWrapper>
      ) : (
        <p>{t('No users')}</p>
      )}
    </>
  );
};

export default Tranche;
