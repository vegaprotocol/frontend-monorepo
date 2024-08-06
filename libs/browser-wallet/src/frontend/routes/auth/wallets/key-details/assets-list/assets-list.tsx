import { Intent, Notification } from '@vegaprotocol/ui-toolkit';

import { AsyncRenderer } from '@/components/async-renderer';
import { SubHeader } from '@/components/sub-header';
import { VegaSection } from '@/components/vega-section';
import { useAssetsStore } from '@/stores/assets-store';

import { useAccountsStore } from './accounts-store';
import { AssetCard } from './asset-card';
import { AssetListEmptyState } from './asset-list-empty-state';
import { useAccounts } from './use-accounts';

export const locators = {
  assetListDescription: 'asset-list-description',
};

export const AssetsList = ({ publicKey }: { publicKey: string }) => {
  const { error: accountsError } = useAccountsStore((state) => ({
    error: state.error,
  }));
  const { error: assetsError } = useAssetsStore((state) => ({
    error: state.error,
  }));

  const { accountsByAsset } = useAccounts(publicKey);

  return (
    <VegaSection>
      <AsyncRenderer
        error={accountsError || assetsError}
        noData={Object.keys(accountsByAsset).length === 0}
        renderNoData={() => <AssetListEmptyState publicKey={publicKey} />}
        errorView={(error) => (
          <Notification
            intent={Intent.Danger}
            message={`An error occurred when loading account information: ${error.message}`}
          />
        )}
        render={() => (
          <>
            <SubHeader content="Balances" />
            <p
              data-testid={locators.assetListDescription}
              className="text-vega-dark-400 my-3"
            >
              Recent balance changes caused by your open positions may not be
              reflected below
            </p>
            {Object.entries(accountsByAsset).map(([assetId, value]) => (
              <AssetCard key={assetId} accounts={value} assetId={assetId} />
            ))}
          </>
        )}
      />
    </VegaSection>
  );
};
