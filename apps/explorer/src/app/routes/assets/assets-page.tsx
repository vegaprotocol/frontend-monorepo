import { t } from '@vegaprotocol/i18n';
import { RouteTitle } from '../../components/route-title';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { useAssetsDataProvider } from '@vegaprotocol/assets';
import { AssetsTable } from '../../components/assets/assets-table';

export const AssetsPage = () => {
  useDocumentTitle(['Assets']);
  useScrollToLocation();

  const { data, loading, error } = useAssetsDataProvider();

  return (
    <section>
      <RouteTitle data-testid="assets-header">{t('Assets')}</RouteTitle>
      <AsyncRenderer
        noDataMessage={t('This chain has no assets')}
        data={data}
        loading={loading}
        error={error}
      >
        <div className="h-full relative">
          <AssetsTable data={data} />
        </div>
      </AsyncRenderer>
    </section>
  );
};
