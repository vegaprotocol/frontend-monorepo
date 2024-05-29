import { t } from '@vegaprotocol/i18n';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../../../routes/route-names';
import { Button, Loader } from '@vegaprotocol/ui-toolkit';
import { PartyBlock } from './party-block';
import type { AccountFields } from '@vegaprotocol/accounts';
import { useExplorerPartyDepositsWithdrawalsQuery } from './__generated__/Party-deposits-withdrawals';
import {
  combineDepositsWithdrawals,
  isDepositStatus,
} from './lib/combine-deposits-withdrawals';
import {
  TableCell,
  TableRow,
  TableWithTbody,
} from '../../../../components/table';
import {
  EthExplorerLinkTypes,
  ExternalExplorerLink,
} from '../../../../components/links/external-explorer-link/external-explorer-link';
import AssetBalance from '../../../..//components/asset-balance/asset-balance';
import type { DepositStatus, WithdrawalStatus } from '@vegaprotocol/types';
import {
  DepositStatusMapping,
  WithdrawalStatusMapping,
} from '@vegaprotocol/types';
import { Time } from '../../../../components/time';

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
      {loading ? (
        <Loader />
      ) : (
        <TableWithTbody>
          {sortedData
            .filter((e) => !!e)
            .flatMap((ledger) => {
              const chain =
                ledger?.asset.source.__typename &&
                ledger.asset.source.__typename === 'ERC20' &&
                ledger.asset.source.chainId
                  ? ledger?.asset.source.chainId
                  : undefined;
              const status = getDepositWithdrawalStatusLabel(ledger?.status);

              return (
                <TableRow>
                  <TableCell>{ledger?.__typename}</TableCell>
                  <TableCell align={'right'}>
                    {ledger?.asset.id && ledger.amount && (
                      <AssetBalance
                        hideLabel={true}
                        price={ledger.amount}
                        assetId={ledger?.asset.id}
                        rounded={true}
                      />
                    )}
                  </TableCell>
                  <TableCell align={'center'}>
                    {ledger?.createdTimestamp && (
                      <Time date={ledger.createdTimestamp} />
                    )}
                  </TableCell>
                  <TableCell>{status}</TableCell>
                  <TableCell>
                    {ledger?.txHash && (
                      <ExternalExplorerLink
                        id={ledger?.txHash}
                        type={EthExplorerLinkTypes.tx}
                        chain={chain}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableWithTbody>
      )}
    </PartyBlock>
  );
};

export function getDepositWithdrawalStatusLabel(
  status?: DepositStatus | WithdrawalStatus
) {
  if (status !== undefined) {
    if (isDepositStatus(status)) {
      return DepositStatusMapping[status];
    } else {
      return WithdrawalStatusMapping[status];
    }
  }

  return t('Unknown');
}
