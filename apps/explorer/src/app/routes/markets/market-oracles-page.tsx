import { t } from '@vegaprotocol/i18n';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useParams } from 'react-router-dom';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import { PageTitle } from '../../components/page-helpers/page-title';
import { useExplorerOracleForMarketQuery } from '../oracles/__generated__/OraclesForMarkets';
import { OraclesTable } from '../../components/oracle-table';

type Params = { marketId: string };

export const MarketOraclesPage = () => {
  useScrollToLocation();

  const { marketId } = useParams<Params>();
  const { data, error, loading } = useExplorerOracleForMarketQuery({
    errorPolicy: 'ignore',
    variables: {
      id: marketId || '1',
    },
  });

  useDocumentTitle([marketId ? marketId : 'market', 'Oracles for Market']);

  return (
    <section className="relative">
      <PageTitle
        data-testid="markets-heading"
        title={t('Oracles for market')}
      />
      <AsyncRenderer
        noDataMessage={t('This chain has no markets')}
        errorMessage={t('Could not fetch market') + ' ' + marketId}
        data={data}
        loading={loading}
        error={error}
      >
        <OraclesTable data={data} />
      </AsyncRenderer>
    </section>
  );
};
