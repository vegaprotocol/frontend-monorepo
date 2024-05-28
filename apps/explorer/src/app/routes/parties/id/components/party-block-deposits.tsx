import { t } from '@vegaprotocol/i18n';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../../../routes/route-names';
import { Button, Loader } from '@vegaprotocol/ui-toolkit';
import { PartyBlock } from './party-block';
import type { AccountFields } from '@vegaprotocol/accounts';
import { useExplorerPartyDepositsWithdrawalsQuery } from './__generated__/Party-deposits-withdrawals';
import { combineDepositsWithdrawals } from './lib/combine-deposits-withdrawals';

export interface PartyBlockAccountProps {
  partyId: string;
  accountData: AccountFields[] | null;
  accountLoading: boolean;
  accountError?: Error;
}

/**
 * Displays an overview of a party's assets. This uses existing data
 * providers to structure the details by asset, rather than looking at
 * it by account. The assumption is that this is a more natural way to
 * get an idea of the assets and activity of a party.
 */
export const PartyBlockDeposits = ({
  partyId,
  accountData,
  accountLoading,
  accountError,
}: PartyBlockAccountProps) => {
  const navigate = useNavigate();

  const { data, loading } = useExplorerPartyDepositsWithdrawalsQuery({
    variables: { partyId },
  });

  const sortedData = data ? combineDepositsWithdrawals(data) : [];

  const shouldShowActionButton =
    accountData && accountData.length > 0 && !accountLoading && !accountError;

  const action = shouldShowActionButton ? (
    <Button
      size="sm"
      onClick={() => navigate(`/${Routes.PARTIES}/${partyId}/assets`)}
    >
      {t('Show all')}
    </Button>
  ) : null;

  return (
    <PartyBlock title={t('Deposits & Withdrawals')} action={action}>
      {loading ? <Loader /> : <code>{JSON.stringify(sortedData)}</code>}
    </PartyBlock>
  );
};
