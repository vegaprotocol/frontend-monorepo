import { t } from '@vegaprotocol/i18n';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../../components/page-header';
import { useDocumentTitle } from '../../../../hooks/use-document-title';
import { useExplorerPartyDepositsWithdrawalsQuery } from '../components/__generated__/Party-deposits-withdrawals';
import { combineDepositsWithdrawals } from '../components/lib/combine-deposits-withdrawals';
import { TableHeader } from '../../../../components/table';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { useMemo } from 'react';
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
  const isTruncated = useMemo(
    () => ['xs', 'sm', 'md', 'lg'].includes(screenSize),
    [screenSize]
  );
  const isRounded = useMemo(
    () => ['xs', 'sm'].includes(screenSize),
    [screenSize]
  );

  useDocumentTitle(['Deposits & Withdrawals']);

  return (
    <section>
      <PageHeader title={t('Deposits & Withdrawals')} />
      <div className="block min-h-44 w-full border-red-800 relative">
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
