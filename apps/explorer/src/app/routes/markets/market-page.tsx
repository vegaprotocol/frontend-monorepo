import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MarketDetails } from '../../components/markets/market-details';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';
import compact from 'lodash/compact';
import { JsonViewerDialog } from '../../components/dialogs/json-viewer-dialog';
import { marketInfoWithDataProvider } from '@vegaprotocol/markets';
import { PageTitle } from '../../components/page-helpers/page-title';

type Params = { marketId: string };

export const MarketPage = () => {
  useScrollToLocation();

  const { marketId } = useParams<Params>();

  const { data, loading, error } = useDataProvider({
    dataProvider: marketInfoWithDataProvider,
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
        <PageTitle
          data-testid="markets-heading"
          title={data?.tradableInstrument.instrument.name || ''}
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
          noDataMessage={t('This chain has no markets')}
          errorMessage={t('Could not fetch market') + ' ' + marketId}
          data={data}
          loading={loading}
          error={error}
        >
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
