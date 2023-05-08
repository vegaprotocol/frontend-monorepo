import { proposalsDataProvider } from '@vegaprotocol/proposals';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { ProposalsTable } from '../../components/proposals/proposals-table';
import { RouteTitle } from '../../components/route-title';
import { useScrollToLocation } from '../../hooks/scroll-to-location';
import { useDocumentTitle } from '../../hooks/use-document-title';

export const Proposals = () => {
  useScrollToLocation();

  const { data, loading, error } = useDataProvider({
    dataProvider: proposalsDataProvider,
    variables: {},
  });

  useDocumentTitle([t('Governance Proposals')]);

  return (
    <section>
      <RouteTitle data-testid="proposals-heading">
        {t('Governance proposals')}
      </RouteTitle>
      <AsyncRenderer
        noDataMessage={t('This chain has no proposals')}
        data={data}
        loading={loading}
        error={error}
      >
        <ProposalsTable data={data} />
      </AsyncRenderer>
    </section>
  );
};
