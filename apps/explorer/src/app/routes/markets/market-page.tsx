import { t, useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MarketDetails } from '../../components/markets/market-details';
import { RouteTitle } from '../../components/route-title';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import compact from 'lodash/compact';
import { JsonViewerDialog } from '../../components/dialogs/json-viewer-dialog';
import { marketInfoProvider } from '@vegaprotocol/market-info';

export const MarketPage = () => {
  useScrollToLocation();

  const { marketId } = useParams<{ marketId: string }>();

  const { data, loading, error } = useDataProvider({
    dataProvider: marketInfoProvider,
    skipUpdates: true,
    variables: {
      marketId: marketId || '',
      skip: !marketId,
    },
  });

  useDocumentTitle(
    compact(['Market details', data?.tradableInstrument.instrument.name])
  );

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <>
      <section className="relative">
        <RouteTitle data-testid="markets-heading">
          {data?.tradableInstrument.instrument.name}
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
          {data && <MarketDetails market={data} />}
        </AsyncRenderer>
      </section>
      <JsonViewerDialog
        open={dialogOpen}
        onChange={(isOpen) => setDialogOpen(isOpen)}
        title={data?.tradableInstrument.instrument.name || ''}
        content={data}
      />
    </>
  );
};
