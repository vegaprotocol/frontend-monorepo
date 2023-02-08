import { ApolloProvider } from '@apollo/client';
import { createClient, useHeaderStore } from '@vegaprotocol/apollo-client';
import { Dialog, Radio } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEnvironment } from '../../hooks';
import { useStatisticsQuery } from '../../utils/__generated__/Node';

export const NodeSwitcher = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (x: boolean) => void;
}) => {
  const { nodes, setUrl } = useEnvironment((store) => ({
    status: store.status,
    nodes: store.nodes,
    setUrl: store.setUrl,
  }));

  const [customUrl, setCustomUrl] = useState('');
  const [displayCustom, setDisplayCustom] = useState(false);
  const [highestBlock, setHighestBlock] = useState<number | null>(null);

  const handleHighestBlock = useCallback((blockHeight: number) => {
    setHighestBlock((curr) => {
      if (curr === null) {
        return blockHeight;
      }
      if (blockHeight > curr) {
        return blockHeight;
      }
      return curr;
    });
  }, []);

  return (
    <Dialog open={open} onChange={setOpen}>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">node</th>
            <th className="text-right">response time</th>
            <th className="text-right">core block height</th>
            <th className="text-right">datanode block height</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => {
            return (
              <tr key={node} onClick={() => setUrl(node)}>
                <RowWrapper url={node}>
                  <Row
                    url={node}
                    onBlockHeight={handleHighestBlock}
                    highestBlock={highestBlock}
                  />
                </RowWrapper>
              </tr>
            );
          })}
        </tbody>
      </table>
      <hr />
      <div>
        Custom
        <input
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          className="border"
        />
        <button
          onClick={() => {
            if (!isValidUrl(customUrl)) {
              return;
            }
            setDisplayCustom(true);
          }}
        >
          Check
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">node</th>
            <th className="text-right">response time</th>
            <th className="text-right">core block height</th>
            <th className="text-right">datanode block height</th>
          </tr>
        </thead>
        <tbody>
          <tr onClick={() => setUrl(customUrl)}>
            {displayCustom && (
              <RowWrapper url={customUrl}>
                <Row
                  url={customUrl}
                  onBlockHeight={handleHighestBlock}
                  highestBlock={highestBlock}
                />
              </RowWrapper>
            )}
          </tr>
        </tbody>
      </table>
    </Dialog>
  );
};

const RowWrapper = ({
  url,
  children,
}: {
  url: string;
  children: ReactNode;
}) => {
  const client = useMemo(
    () =>
      createClient({
        url,
        cacheConfig: undefined,
        retry: false,
        connectToDevTools: false,
      }),
    [url]
  );
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
const Row = ({
  url,
  highestBlock,
  onBlockHeight,
}: {
  url: string;
  highestBlock: number | null;
  onBlockHeight: (blockHeight: number) => void;
}) => {
  const [time, setTime] = useState<number>();
  const { data } = useStatisticsQuery({
    pollInterval: 3000,
    fetchPolicy: 'no-cache',
  });
  const headerStore = useHeaderStore();
  const headers = headerStore[url];

  useEffect(() => {
    const requestUrl = new URL(url);
    const requests = window.performance.getEntriesByName(requestUrl.href);
    const { duration } =
      (requests.length && requests[requests.length - 1]) || {};
    setTime(duration);
  }, [url]);

  useEffect(() => {
    if (headers?.blockHeight) {
      onBlockHeight(headers.blockHeight);
    }
  }, [headers?.blockHeight, onBlockHeight]);

  const headerBlockHeightClass = classNames('text-right', {
    // red if datanode block height is more than 5 behind highest block height across all nodes
    'text-vega-pink':
      highestBlock !== null &&
      headers &&
      headers.blockHeight < highestBlock - 5,
    // if datanode block height is more than three behind core block height
    'text-vega-orange':
      headers &&
      data &&
      headers.blockHeight < Number(data.statistics.blockHeight),
  });

  return (
    <>
      <td>{url}</td>
      <td className="text-right">{time ? time.toFixed(2) + 'ms' : 'n/a'}</td>
      <td className="text-right">{data?.statistics.blockHeight || '-'}</td>
      <td className={headerBlockHeightClass}>{headers?.blockHeight || '-'}</td>
    </>
  );
};

const isValidUrl = (url?: string) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
