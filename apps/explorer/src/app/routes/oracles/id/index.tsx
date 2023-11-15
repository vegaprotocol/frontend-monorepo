import { RouteTitle } from '../../../components/route-title';
import { truncateByChars } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { useParams } from 'react-router-dom';
import { useExplorerOracleSpecByIdQuery } from '../__generated__/Oracles';
import { OracleDetails } from '../components/oracle';
import { AsyncRenderer, SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import filter from 'recursive-key-filter';
import { TruncateInline } from '../../../components/truncate/truncate';

type Params = { id: string };

export const Oracle = () => {
  const { id } = useParams<Params>();

  useDocumentTitle(['Oracle', `Oracle #${truncateByChars(id || '1', 5, 5)}`]);

  const { data, error, loading } = useExplorerOracleSpecByIdQuery({
    variables: {
      id: id || '1',
    },
  });

  return (
    <section>
      <RouteTitle data-testid="block-header">
        {t(`Oracle `)}
        <TruncateInline startChars={5} endChars={5} text={id || '1'} />
      </RouteTitle>
      <AsyncRenderer
        data={data}
        error={error}
        loading={loading}
        noDataCondition={(data) => !data?.oracleSpec}
        errorMessage={t('Could not load oracle data')}
        loadingMessage={t('Loading oracle data...')}
      >
        {data?.oracleSpec ? (
          <div id={id} key={id} className="mb-10">
            <OracleDetails
              id={id || ''}
              dataSource={data?.oracleSpec}
              dataConnection={data?.oracleSpec.dataConnection}
            />
            <details className="mt-5 cursor-pointer">
              <summary>JSON</summary>
              <SyntaxHighlighter data={filter(data, ['__typename'])} />
            </details>
          </div>
        ) : (
          <span></span>
        )}
      </AsyncRenderer>
    </section>
  );
};
