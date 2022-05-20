import { t, useFetch } from '@vegaprotocol/react-helpers';
import { RouteTitle } from '../../components/route-title';
import { SyntaxHighlighter } from '@vegaprotocol/ui-toolkit';
import { DATA_SOURCES } from '../../config';
import type { TendermintGenesisResponse } from './tendermint-genesis-response';

const Genesis = () => {
  const {
    state: { data: genesis },
  } = useFetch<TendermintGenesisResponse>(
    `${DATA_SOURCES.tendermintUrl}/genesis`
  );
  if (!genesis?.result.genesis) return null;
  return (
    <section>
      <RouteTitle data-testid="genesis-header">{t('Genesis')}</RouteTitle>
      <SyntaxHighlighter data={genesis?.result.genesis} />
    </section>
  );
};

export default Genesis;
