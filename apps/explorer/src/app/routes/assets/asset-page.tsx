import { t } from '@vegaprotocol/i18n';
import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { AssetDetailsTable, useAssetDataProvider } from '@vegaprotocol/assets';
import { useParams } from 'react-router-dom';
import { JsonViewerDialog } from '../../components/dialogs/json-viewer-dialog';
import { useState } from 'react';
import { PageTitle } from '../../components/page-helpers/page-title';

type Params = { assetId: string };

export const AssetPage = () => {
  useDocumentTitle(['Assets']);
  useScrollToLocation();

  const { assetId } = useParams<Params>();
  const { data, loading, error } = useAssetDataProvider(assetId || '');

  const title = data ? data.name : error ? t('Asset not found') : '';
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <>
      <section className="relative">
        <PageTitle
          data-testid="asset-header"
          title={title}
          actions={
            <Button
              disabled={!data}
              size="xs"
              onClick={() => setDialogOpen(true)}
            >
              {t('View JSON')}
            </Button>
          }
        />
        <AsyncRenderer
          noDataMessage={t('Asset not found')}
          data={data}
          loading={loading}
          error={error}
        >
          <div className="relative h-full">
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
