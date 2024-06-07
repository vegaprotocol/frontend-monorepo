import { t } from '@vegaprotocol/i18n';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../../components/page-header';
import { useDocumentTitle } from '../../../../hooks/use-document-title';
import { useExplorerPartyDepositsWithdrawalsQuery } from '../components/__generated__/Party-deposits-withdrawals';
import { combineDepositsWithdrawals } from '../components/lib/combine-deposits-withdrawals';
import {
  EthExplorerLinkTypes,
  ExternalExplorerLink,
} from '../../../../components/links/external-explorer-link/external-explorer-link';
import { Time } from '../../../../../app/components/time';
import { getDepositWithdrawalStatusLabel } from '../components/party-block-deposits';
import AssetBalance from '../../../../components/asset-balance/asset-balance';
import { TableCell, TableHeader, TableRow } from '../../../../components/table';

type Params = { party: string };

export function PartyDepositsWithdrawals() {
  const { party } = useParams<Params>();

  const { data } = useExplorerPartyDepositsWithdrawalsQuery({
    variables: {
      partyId: party || '',
      first: 100,
    },
  });

  const sortedData = data ? combineDepositsWithdrawals(data, 50) : [];

  useDocumentTitle(['Deposits & Withdrawals']);

  return (
    <section>
      <PageHeader title={t('Deposits & Withdrawals')} />
      <div className="block min-h-44 w-full border-red-800 relative">
        <table className="w-full">
          <thead>
            <tr>
              <TableHeader className="text-right px-4">{t('Type')}</TableHeader>
              <TableHeader className="text-left px-4">
                {t('Amount')}
              </TableHeader>
              <TableHeader className="text-left px-4">{t('Date')}</TableHeader>
              <TableHeader className="text-left px-4">
                {t('Status')}
              </TableHeader>
              <TableHeader className="text-left px-4">Origin</TableHeader>
            </tr>
          </thead>
          <tbody>
            {sortedData
              .filter((e) => !!e)
              .flatMap((ledger) => {
                const chain =
                  ledger?.asset.source.__typename &&
                  ledger.asset.source.__typename === 'ERC20' &&
                  ledger.asset.source.chainId
                    ? ledger?.asset.source.chainId
                    : undefined;
                const status = getDepositWithdrawalStatusLabel(
                  ledger?.status,
                  ledger?.txHash
                );

                return (
                  <TableRow>
                    <TableCell>{ledger?.__typename}</TableCell>
                    <TableCell align={'right'}>
                      {ledger?.asset.id && ledger.amount && (
                        <AssetBalance
                          hideLabel={true}
                          price={ledger.amount}
                          assetId={ledger?.asset.id}
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
          </tbody>
        </table>
      </div>
    </section>
  );
}
