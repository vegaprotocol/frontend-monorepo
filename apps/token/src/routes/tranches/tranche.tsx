import {
  KeyValueTable,
  KeyValueTableRow,
  Link,
  RoundedWrapper,
} from '@vegaprotocol/ui-toolkit';
import { Link as RouterLink } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Navigate } from 'react-router-dom';
import { formatNumber } from '@vegaprotocol/react-helpers';

import { useOutletContext } from 'react-router-dom';
import { useEnvironment } from '@vegaprotocol/environment';
import { TrancheItem } from '../redemption/tranche-item';
import Routes from '../routes';
import { TrancheLabel } from './tranche-label';
import type { Tranche as TrancheType } from '../../lib/tranches/tranches-store';

export const Tranche = () => {
  const tranches = useOutletContext<TrancheType[]>();
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();
  const { trancheId } = useParams<{ trancheId: string }>();
  const { chainId } = useWeb3React();
  const tranche = tranches.find(
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
        className="flex justify-between gap-x-4 py-2 px-4"
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
              <h1>{t('Etherscan')}</h1>
            </KeyValueTableRow>
            {tranche.users.map((user) => (
              <KeyValueTableRow key={user}>
                {
                  <RouterLink
                    title={t('View on Etherscan (opens in a new tab)')}
                    to={`${Routes.REDEEM}/${user}`}
                  >
                    {user}
                  </RouterLink>
                }
                {
                  <Link
                    title={t('View on Etherscan (opens in a new tab)')}
                    href={`${ETHERSCAN_URL}/address/${user}`}
                    target="_blank"
                  >
                    {t('View on Etherscan')}
                  </Link>
                }
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
