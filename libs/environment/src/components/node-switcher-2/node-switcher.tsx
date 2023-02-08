import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { createClient, useHeaderStore } from '@vegaprotocol/apollo-client';
import { t } from '@vegaprotocol/react-helpers';
import {
  Button,
  Dialog,
  Input,
  Radio,
  RadioGroup,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEnvironment } from '../../hooks';
import { useStatisticsQuery } from '../../utils/__generated__/Node';

const POLL_INTERVAL = 3000;

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

  const [nodeRadio, setNodeRadio] = useState<string>('');
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
      <div>
        <RadioGroup
          value={nodeRadio}
          onChange={(value) => {
            setNodeRadio(value);
          }}
        >
          <table className="w-full">
            <thead>
              <tr>
                <th />
                <th className="text-left">node</th>
                <th className="text-right">response time</th>
                <th className="text-right">core block height</th>
                <th className="text-right">datanode block height</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => {
                return (
                  <tr key={node}>
                    <ClientWrapper
                      url={node}
                      renderChildren={(client) => (
                        <>
                          <RowLabels url={node} />
                          <RowData
                            client={client}
                            url={node}
                            highestBlock={highestBlock}
                            onBlockHeight={handleHighestBlock}
                          />
                        </>
                      )}
                    />
                  </tr>
                );
              })}
              <tr>
                <CustomRowWrapper
                  highestBlock={highestBlock}
                  onBlockHeight={handleHighestBlock}
                  nodeRadio={nodeRadio}
                />
              </tr>
            </tbody>
          </table>
        </RadioGroup>
        <div className="mt-4">
          <Button
            fill={true}
            onClick={() => {
              setUrl(nodeRadio);
            }}
          >
            {t('Connect to this node')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

const ClientWrapper = ({
  url,
  renderChildren,
}: {
  url: string;
  renderChildren: (client: ApolloClient<NormalizedCacheObject>) => ReactNode;
}) => {
  const client = useMemo(
    () =>
      createClient({
        url,
        cacheConfig: undefined,
        retry: false,
        connectToDevTools: false,
        connectToHeaderStore: true,
      }),
    [url]
  );
  return <>{renderChildren(client)}</>;
};

const RowLabels = ({ url }: { url: string }) => {
  return (
    <>
      <td>
        <Radio id={`node-url-${url}`} value={url} label="" />
      </td>
      <td>{url}</td>
    </>
  );
};

const RowData = ({
  client,
  url,
  highestBlock,
  onBlockHeight,
}: {
  client: ApolloClient<NormalizedCacheObject>;
  url: string;
  highestBlock: number | null;
  onBlockHeight: (blockHeight: number) => void;
}) => {
  console.log(client);
  const [time, setTime] = useState<number>();
  const { data, startPolling, stopPolling } = useStatisticsQuery({
    client,
    // pollInterval doesnt seem to work any more
    // https://github.com/apollographql/apollo-client/issues/9819
    ssr: false,
  });
  const headerStore = useHeaderStore();
  const headers = headerStore[url];

  useEffect(() => {
    const handleStartPoll = () => startPolling(POLL_INTERVAL);
    const handleStopPoll = () => stopPolling();
    window.addEventListener('blur', handleStopPoll);
    window.addEventListener('focus', handleStartPoll);
    handleStartPoll();
    return () => {
      window.removeEventListener('blur', handleStopPoll);
      window.removeEventListener('focus', handleStartPoll);
    };
  }, [startPolling, stopPolling]);

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
      <td className="text-right">{time ? time.toFixed(2) + 'ms' : 'n/a'}</td>
      <td className="text-right">{data?.statistics.blockHeight || '-'}</td>
      <td className={headerBlockHeightClass}>{headers?.blockHeight || '-'}</td>
    </>
  );
};

const CustomRowWrapper = ({
  highestBlock,
  nodeRadio,
  onBlockHeight,
}: {
  highestBlock: number | null;
  nodeRadio: string;
  onBlockHeight: (blockHeight: number) => void;
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const [displayCustom, setDisplayCustom] = useState(false);

  return (
    <>
      <td>
        <Radio id="node-url-other" value="other" label="" />
      </td>
      <td>
        {nodeRadio === 'other' ? (
          <>
            <Input
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
              {t('Check')}
            </button>
          </>
        ) : (
          t('Other')
        )}
      </td>
      {displayCustom ? (
        <ClientWrapper
          url={customUrl}
          renderChildren={(client) => (
            <RowData
              client={client}
              url={customUrl}
              onBlockHeight={onBlockHeight}
              highestBlock={highestBlock}
            />
          )}
        ></ClientWrapper>
      ) : (
        <>
          <td></td>
          <td></td>
          <td></td>
        </>
      )}
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
