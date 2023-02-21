import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MarketDetails } from '../../components/markets/market-details';
import { RouteTitle } from '../../components/route-title';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import compact from 'lodash/compact';
import { JsonViewerDialog } from '../../components/dialogs/json-viewer-dialog';
import { marketInfoNoCandlesDataProvider } from '@vegaprotocol/market-info';
import { PageActions } from '../../components/page-helpers';

export const MarketPage = () => {
  useScrollToLocation();

  const { marketId } = useParams<{ marketId: string }>();

  const variables = useMemo(
    () => ({
      marketId,
    }),
    [marketId]
  );

  const { data, loading, error } = useDataProvider({
    dataProvider: marketInfoNoCandlesDataProvider,
    skipUpdates: true,
    variables,
  });

  useDocumentTitle(
    compact([
      'Market details',
      data?.market?.tradableInstrument.instrument.name,
    ])
  );

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <>
      <section className="relative">
        <RouteTitle data-testid="markets-heading">
          {data?.market?.tradableInstrument.instrument.name}
        </RouteTitle>
        <AsyncRenderer
          noDataMessage={t('This chain has no markets')}
          data={data}
          loading={loading}
          error={error}
        >
          <PageActions>
            <Button size="xs" onClick={() => setDialogOpen(true)}>
              {t('View JSON')}
            </Button>
          </PageActions>
          <MarketDetails market={data?.market} />
        </AsyncRenderer>
      </section>
      <JsonViewerDialog
        open={dialogOpen}
        onChange={(isOpen) => setDialogOpen(isOpen)}
        title={data?.market?.tradableInstrument.instrument.name || ''}
        content={data?.market}
      />
    </>
  );
};
