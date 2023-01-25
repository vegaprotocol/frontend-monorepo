import { RouteTitle } from '../../../components/route-title';
import { RenderFetched } from '../../../components/render-fetched';
import { t, truncateByChars } from '@vegaprotocol/react-helpers';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { useParams } from 'react-router-dom';
import { useExplorerOracleSpecByIdQuery } from '../__generated__/Oracles';
import { OracleDetails } from '../components/oracle';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import filter from 'recursive-key-filter';
import { TruncateInline } from '../../../components/truncate/truncate';

export const Oracle = () => {
  const { id } = useParams<{ id: string }>();

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
      <RenderFetched error={error} loading={loading}>
        {data?.oracleSpec ? (
          <div id={id} key={id} className="mb-10">
            <OracleDetails
              id={id || ''}
              dataSource={data?.oracleSpec}
              dataConnection={data?.oracleSpec}
              showBroadcasts={true}
            />
            <details>
              <summary className="pointer">JSON</summary>
              <SyntaxHighlighter data={filter(data, ['__typename'])} />
            </details>
          </div>
        ) : (
          <span></span>
        )}
      </RenderFetched>
    </section>
  );
};
