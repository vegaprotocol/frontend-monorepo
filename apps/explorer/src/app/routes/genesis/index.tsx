import { SyntaxHighlighter } from '../../components/syntax-highlighter';
import { DATA_SOURCES } from '../../config';
import useFetch from '../../hooks/use-fetch';
import { TendermintGenesisResponse } from './tendermint-genesis-response';

const Genesis = () => {
  const {
    state: { data: genesis },
  } = useFetch<TendermintGenesisResponse>(
    `${DATA_SOURCES.tendermintUrl}/genesis`
  );
  if (!genesis?.result.genesis) return null;
  return (
    <section>
      <h1>Genesis</h1>
      <SyntaxHighlighter data={genesis?.result.genesis} />
    </section>
  );
};

export default Genesis;
