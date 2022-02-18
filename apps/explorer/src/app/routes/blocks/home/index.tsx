import { DATA_SOURCES } from '../../../config';
import useFetch from '../../../hooks/use-fetch';
import { NewBlockMessage } from '../tendermint-new-block';
import { TendermintBlockchainResponse } from '../tendermint-blockchain-response';
import { useTendermintWebsocket } from '../../../hooks/use-tendermint-websocket';

const MAX_BLOCKS = 10;

const Blocks = () => {
  const { messages: blocks } = useTendermintWebsocket<NewBlockMessage>(
    {
      query: "tm.event = 'NewBlock'",
    },
    MAX_BLOCKS
  );
  const { data } = useFetch<TendermintBlockchainResponse>(
    `${DATA_SOURCES.tendermintUrl}/blockchain`
  );

  return (
    <section>
      <h1>Blocks</h1>
      <h2>Blocks from blockchain</h2>
      {`${DATA_SOURCES.tendermintUrl}/blockchain`}
      <br />
      <div>Height: {data?.result?.last_height || 0}</div>
      <br />
      <div>
        <br />
        <pre>{JSON.stringify(data, null, '  ')}</pre>
      </div>
      <h2>Blocks streamed in</h2>
      <div>
        <br />
        <pre>{JSON.stringify(blocks, null, '  ')}</pre>
      </div>
    </section>
  );
};

export { Blocks };
