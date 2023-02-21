import { t } from '@vegaprotocol/react-helpers';
import { RouteTitle } from '../../components/route-title';
import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { AssetDetailsTable, useAssetDataProvider } from '@vegaprotocol/assets';
import { useParams } from 'react-router-dom';
import { JsonViewerDialog } from '../../components/dialogs/json-viewer-dialog';
import { useState } from 'react';
import { PageActions } from '../../components/page-helpers';

export const AssetPage = () => {
  useDocumentTitle(['Assets']);
  useScrollToLocation();

  const { assetId } = useParams<{ assetId: string }>();
  const { data, loading, error } = useAssetDataProvider(assetId || '');

  const title = data ? data.name : error ? t('Asset not found') : '';
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <>
      <section className="relative">
        <RouteTitle data-testid="asset-header">{title}</RouteTitle>
        <AsyncRenderer
          noDataMessage={t('Asset not found')}
          data={data}
          loading={loading}
          error={error}
        >
          <PageActions>
            <Button size="xs" onClick={() => setDialogOpen(true)}>
              {t('View JSON')}
            </Button>
          </PageActions>
          <div className="h-full relative">
            <AssetDetailsTable asset={data as AssetFieldsFragment} />
          </div>
        </AsyncRenderer>
      </section>
      <JsonViewerDialog
        open={dialogOpen}
        onChange={(isOpen) => setDialogOpen(isOpen)}
        title={data?.name || ''}
        content={data}
      />
    </>
  );
};
