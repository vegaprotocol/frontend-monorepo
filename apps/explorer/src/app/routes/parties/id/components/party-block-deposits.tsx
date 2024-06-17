import { t } from '@vegaprotocol/i18n';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../../../routes/route-names';
import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { PartyBlock } from './party-block';
import type { AccountFields } from '@vegaprotocol/accounts';
import { useExplorerPartyDepositsWithdrawalsQuery } from './__generated__/Party-deposits-withdrawals';
import {
  type DepositOrWithdrawal,
  combineDepositsWithdrawals,
} from './lib/combine-deposits-withdrawals';
import { Table, TableCell, TableRow } from '../../../../components/table';
import {
  EthExplorerLinkTypes,
  ExternalExplorerLink,
} from '../../../../components/links/external-explorer-link/external-explorer-link';
import AssetBalance from '../../../..//components/asset-balance/asset-balance';
import { Time } from '../../../../components/time';
import {
  DepositWithdrawalStatusIcon,
  getDepositWithdrawalStatusLabel,
} from './party-deposits-withdrawals-status-icon';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';

export interface PartyBlockAccountProps {
  partyId: string;
  accountData: AccountFields[] | null;
  accountLoading: boolean;
  accountError?: Error;
}

/**
 * Displays deposits & withdrawals for a party, sorted most-recent-first, with a button to show all.
 * By default it is limited to 5 entries on the party by ID page, then in a nested route it can show
 * all of them in
 */
export const PartyBlockDeposits = ({
  partyId,
  accountLoading,
  accountError,
}: PartyBlockAccountProps) => {
  const navigate = useNavigate();

  const { data, error, loading } = useExplorerPartyDepositsWithdrawalsQuery({
    variables: { partyId },
  });

  const sortedData = data ? combineDepositsWithdrawals(data) : [];

  const { screenSize } = useScreenDimensions();
  const isTruncated = useMemo(
    () => ['xs', 'sm', 'md', 'lg'].includes(screenSize),
    [screenSize]
  );
  const isRounded = useMemo(
    () => ['xs', 'sm'].includes(screenSize),
    [screenSize]
  );

  const shouldShowActionButton =
    sortedData &&
    sortedData.length >= 3 &&
    accountLoading === false &&
    accountError === undefined;

  const action = shouldShowActionButton ? (
    <Button
      size="sm"
      onClick={() =>
        navigate(`/${Routes.PARTIES}/${partyId}/deposits-withdrawals`)
      }
    >
      {t('Show all')}
    </Button>
  ) : null;

  return (
    <PartyBlock title={t('Deposits & Withdrawals')} action={action}>
      <AsyncRenderer loading={loading} error={error} data={sortedData}>
        {sortedData && sortedData.length !== 0 ? (
          <Table>
            <tbody>
              {sortedData
                .filter((e) => !!e)
                .flatMap((ledger) => (
                  <PartyDepositsWithdrawalRow
                    isRounded={isRounded}
                    isTruncated={isTruncated}
                    ledger={ledger}
                  />
                ))}
            </tbody>
          </Table>
        ) : (
          <p>{t('No recent deposits or withdrawals')}</p>
        )}
      </AsyncRenderer>
    </PartyBlock>
  );
};

export type PartyDepositsWithdrawalRowProps = {
  isRounded: boolean;
  isTruncated: boolean;
  ledger: DepositOrWithdrawal;
};

export const PartyDepositsWithdrawalRow = ({
  isRounded = false,
  isTruncated = false,
  ledger,
}: PartyDepositsWithdrawalRowProps) => {
  const chain =
    ledger?.asset.source.__typename &&
    ledger.asset.source.__typename === 'ERC20' &&
    ledger.asset.source.chainId
      ? ledger?.asset.source.chainId
      : undefined;

  return (
    <TableRow>
      {!isRounded && (
        <TableCell>
          {ledger?.__typename === 'Deposit' ? t('Deposit') : t('Withdrawal')}
        </TableCell>
      )}
      <TableCell
        align="left"
        className="px-2"
        title={getDepositWithdrawalStatusLabel(ledger?.status, ledger?.txHash)}
      >
        <DepositWithdrawalStatusIcon
          status={ledger?.status}
          hash={ledger?.txHash}
        />
      </TableCell>
      <TableCell align="left">
        {ledger?.txHash && (
          <ExternalExplorerLink
            truncate={isTruncated}
            id={ledger?.txHash}
            type={EthExplorerLinkTypes.tx}
            chain={chain}
          />
        )}
      </TableCell>
      <TableCell align={'right'}>
        {ledger?.__typename === 'Deposit' ? '+' : '-'}
        {ledger?.asset.id && ledger.amount && (
          <AssetBalance
            hideLabel={true}
            price={ledger.amount}
            assetId={ledger?.asset.id}
            rounded={isRounded}
          />
        )}
      </TableCell>
      <TableCell align={'right'}>
        {ledger?.createdTimestamp && <Time date={ledger.createdTimestamp} />}
      </TableCell>
    </TableRow>
  );
};
