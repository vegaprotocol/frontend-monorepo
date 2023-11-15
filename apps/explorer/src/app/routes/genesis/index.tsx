import { t } from '@vegaprotocol/i18n';
import { useFetch } from '@vegaprotocol/react-helpers';
import { RouteTitle } from '../../components/route-title';
import { AsyncRenderer, SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { DATA_SOURCES } from '../../config';
import { type TendermintGenesisResponse } from './tendermint-genesis-response';
import { useDocumentTitle } from '../../hooks/use-document-title';

const Genesis = () => {
  useDocumentTitle(['Genesis']);

  const {
    state: { data, loading, error },
  } = useFetch<TendermintGenesisResponse>(
    `${DATA_SOURCES.tendermintUrl}/genesis`
  );

  return (
    <>
      <RouteTitle data-testid="genesis-header">{t('Genesis')}</RouteTitle>
      <AsyncRenderer
        data={data}
        error={error}
        loading={!!loading}
        loadingMessage={t('Loading genesis information...')}
        errorMessage={t('Could not fetch genesis data')}
      >
        <section>
          <SyntaxHighlighter data={data?.result.genesis} />
        </section>
      </AsyncRenderer>
    </>
  );
};

export default Genesis;
