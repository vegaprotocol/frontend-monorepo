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
              <th className="text-right px-4">{t('Type')}</th>
              <th className="text-left px-4">{t('Amount')}</th>
              <th className="text-left px-4">{t('Date')}</th>
              <th className="text-left px-4">{t('Status')}</th>
              <th className="text-left px-4">-</th>
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
                const status = getDepositWithdrawalStatusLabel(ledger?.status);

                return (
                  <tr>
                    <td>{ledger?.__typename}</td>
                    <td align={'right'}>
                      {ledger?.asset.id && ledger.amount && (
                        <AssetBalance
                          hideLabel={true}
                          price={ledger.amount}
                          assetId={ledger?.asset.id}
                          rounded={true}
                        />
                      )}
                    </td>
                    <td align={'center'}>
                      {ledger?.createdTimestamp && (
                        <Time date={ledger.createdTimestamp} />
                      )}
                    </td>
                    <td>{status}</td>
                    <td>
                      {ledger?.txHash && (
                        <ExternalExplorerLink
                          id={ledger?.txHash}
                          type={EthExplorerLinkTypes.tx}
                          chain={chain}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
