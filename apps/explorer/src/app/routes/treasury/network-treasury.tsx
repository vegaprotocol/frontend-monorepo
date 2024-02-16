import { useDocumentTitle } from '../../hooks/use-document-title';
import type { AccountType } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/i18n';
import { RouteTitle } from '../../components/route-title';
import { NetworkAccountsTable } from './components/network-accounts-table';
import { NetworkTransfersTable } from './components/network-transfers-table';

export type NonZeroAccount = {
  assetId: string;
  balance: string;
  type: AccountType;
};

export const NetworkTreasury = () => {
  useDocumentTitle(['Network Treasury']);
  return (
    <section>
      <RouteTitle data-testid="block-header">{t(`Treasury`)}</RouteTitle>
      <div>
        <NetworkAccountsTable />
      </div>
      <div className="mt-5">
        <h2 className="text-3xl mb-2">{t('Transfers')}</h2>
        <NetworkTransfersTable />
      </div>
    </section>
  );
};
