import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { marketsProvider } from '@vegaprotocol/market-list';
import { RouteTitle } from '../../components/route-title';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { MarketsTable } from '../../components/markets/markets-table';

export const MarketsPage = () => {
  useDocumentTitle(['Markets']);
  useScrollToLocation();

  const { data, loading, error } = useDataProvider({
    dataProvider: marketsProvider,
    skipUpdates: true,
  });

  return (
    <section>
      <RouteTitle data-testid="markets-heading">{t('Markets')}</RouteTitle>
      <AsyncRenderer
        noDataMessage={t('This chain has no markets')}
        data={data}
        loading={loading}
        error={error}
      >
        <MarketsTable data={data} />
      </AsyncRenderer>
    </section>
  );
};
