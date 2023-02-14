import { t, useDataProvider, useYesterday } from '@vegaprotocol/react-helpers';
import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MarketDetails } from '../../components/markets/market-details';
import { RouteTitle } from '../../components/route-title';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import compact from 'lodash/compact';
import { Interval } from '@vegaprotocol/types';
import { JsonViewerDialog } from '../../components/dialogs/json-viewer-dialog';
import { marketInfoDataProvider } from '@vegaprotocol/market-info';

export const MarketPage = () => {
  useScrollToLocation();

  const { marketId } = useParams<{ marketId: string }>();

  const yesterday = useYesterday();
  const yTimestamp = useMemo(() => {
    return new Date(yesterday).toISOString();
  }, [yesterday]);
  const variables = useMemo(
    () => ({
      marketId,
      since: yTimestamp,
      interval: Interval.INTERVAL_I1H,
    }),
    [marketId, yTimestamp]
  );

  const { data, loading, error } = useDataProvider({
    dataProvider: marketInfoDataProvider,
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
          <div className="absolute top-0 right-0">
            <Button size="xs" onClick={() => setDialogOpen(true)}>
              {t('View JSON')}
            </Button>
          </div>
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
