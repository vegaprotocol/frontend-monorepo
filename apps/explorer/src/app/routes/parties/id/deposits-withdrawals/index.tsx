import { t } from '@vegaprotocol/i18n';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../../components/page-header';
import { useDocumentTitle } from '../../../../hooks/use-document-title';
import { useExplorerPartyDepositsWithdrawalsQuery } from '../components/__generated__/PartyDepositsWithdrawals';
import { combineDepositsWithdrawals } from '../components/lib/combine-deposits-withdrawals';
import { TableHeader } from '../../../../components/table';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { PartyDepositsWithdrawalRow } from '../components/party-block-deposits';

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

  const { screenSize } = useScreenDimensions();
  const isTruncated = ['xs', 'sm', 'md', 'lg'].includes(screenSize);
  const isRounded = ['xs', 'sm'].includes(screenSize);

  useDocumentTitle(['Deposits & Withdrawals']);

  return (
    <section className="pt-1">
      <PageHeader title={t('Deposits & Withdrawals')} />
      <div className="mt-4 block min-h-44 w-full border-red-800 relative">
        <table className="w-full">
          <thead>
            <tr>
              {!isRounded && (
                <TableHeader className="text-left pr-4">
                  {t('Type')}
                </TableHeader>
              )}
              <TableHeader className="text-left pr-4">
                {t('Status')}
              </TableHeader>
              <TableHeader className="text-left">{t('Hash')}</TableHeader>
              <TableHeader className="text-right pl-4">
                {t('Amount')}
              </TableHeader>
              <TableHeader className="text-right pl-4">{t('Date')}</TableHeader>
            </tr>
          </thead>
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
        </table>
      </div>
    </section>
  );
}
