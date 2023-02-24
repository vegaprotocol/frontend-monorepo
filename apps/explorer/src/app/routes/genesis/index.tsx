import { t, useFetch } from '@vegaprotocol/utils';
import { RouteTitle } from '../../components/route-title';
import { Loader, SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { DATA_SOURCES } from '../../config';
import type { TendermintGenesisResponse } from './tendermint-genesis-response';
import { useDocumentTitle } from '../../hooks/use-document-title';

const Genesis = () => {
  useDocumentTitle(['Genesis']);

  const {
    state: { data: genesis, loading },
  } = useFetch<TendermintGenesisResponse>(
    `${DATA_SOURCES.tendermintUrl}/genesis`
  );
  if (!genesis?.result.genesis) {
    if (loading) {
      return <Loader />;
    }
    return null;
  }
  return (
    <section>
      <RouteTitle data-testid="genesis-header">{t('Genesis')}</RouteTitle>
      <SyntaxHighlighter data={genesis?.result.genesis} />
    </section>
  );
};

export default Genesis;
