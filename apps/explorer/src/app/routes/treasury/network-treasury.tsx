import { useDocumentTitle } from '../../hooks/use-document-title';
import type { AccountType } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/i18n';
import { RouteTitle } from '../../components/route-title';
import { NetworkAccountsTable } from './components/network-accounts-table';
import { NetworkTransfersTable } from './components/network-transfers-table';
import GovernanceLink from '../../components/links/governance-link/governance-link';

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
      <details className="w-full md:w-3/5 cursor-pointer shadow-lg p-5 dark:border-l-2 dark:border-vega-green">
        <summary>{t('About the Network Treasury')}</summary>
        <section className="mt-4 b-1 border-grey">
          <p className="mb-2">
            The network treasury can hold funds from any active settlement asset
            on the network. It is funded periodically by transfers from Gobalsky
            as part of the Community Adoption Fund (CAF), but in future may
            receive funds from any sources.
          </p>
          <p className="mb-2">
            Funds in the network treasury can be used by creating governance
            initiated transfers via{' '}
            <GovernanceLink text={t('community governance')} />. These transfers
            can be initiated by anyone and be used to fund reward pools, or can
            be used to fund other activities the{' '}
            <abbr className="decoration-dotted" title="Community Adoption Fund">
              CAF
            </abbr>{' '}
            is exploring.
          </p>
          <p>
            This page shows details of the balances in the treasury, pending
            transfers, and historic transfer movements to and from the treasury.
          </p>
        </section>
      </details>
      <div className="mt-6">
        <NetworkAccountsTable />
      </div>
      <div className="mt-5">
        <h2 className="text-3xl mb-2">{t('Transfers')}</h2>
        <NetworkTransfersTable />
      </div>
    </section>
  );
};
