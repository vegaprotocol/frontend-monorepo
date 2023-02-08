import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { createClient, useHeaderStore } from '@vegaprotocol/apollo-client';
import { t } from '@vegaprotocol/react-helpers';
import {
  Button,
  ButtonLink,
  Dialog,
  Input,
  Loader,
  Radio,
  RadioGroup,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEnvironment } from '../../hooks';
import { useStatisticsQuery } from '../../utils/__generated__/Node';
import { LayoutCell } from '../node-switcher/layout-cell';
import { LayoutRow } from '../node-switcher/layout-row';

const POLL_INTERVAL = 3000;
const CUSTOM_NODE_KEY = 'custom';

export const NodeSwitcher = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (x: boolean) => void;
}) => {
  const { nodes, setUrl, status, VEGA_ENV } = useEnvironment((store) => ({
    status: store.status,
    nodes: store.nodes,
    setUrl: store.setUrl,
    VEGA_ENV: store.VEGA_ENV,
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
    <Dialog open={open} onChange={setOpen} size="medium">
      <h3 className="uppercase text-xl text-center mb-2">
        {t('Connected node')}
      </h3>
      {status === 'pending' ? (
        <div className="py-8">
          <p className="mb-4 text-center">{t('Loading configuration...')}</p>
          <Loader size="large" />
        </div>
      ) : (
        <div>
          <p className="mb-2 text-center">
            {t(`This app will only work on a `)}
            <span className="font-mono capitalize">
              {VEGA_ENV.toLowerCase()}
            </span>
            {t(' chain ID')}
          </p>
          <RadioGroup
            value={nodeRadio}
            onChange={(value) => {
              setNodeRadio(value);
            }}
          >
            <div className="hidden lg:block">
              <LayoutRow>
                <div />
                <span className="text-right">{t('Response time')}</span>
                <span className="text-right">{t('Block')}</span>
                <span className="text-right">{t('Subscription')}</span>
              </LayoutRow>
              <div>
                {nodes.map((node, index) => {
                  return (
                    <LayoutRow key={node}>
                      <div className="break-all" data-testid="node">
                        <Radio
                          id={`node-url-${index}`}
                          value={node}
                          label={node}
                          // disabled={getIsNodeDisabled(VEGA_ENV, state[node])}
                        />
                      </div>
                      <ClientWrapper
                        url={node}
                        renderChildren={(client) => (
                          <RowData
                            client={client}
                            url={node}
                            highestBlock={highestBlock}
                            onBlockHeight={handleHighestBlock}
                          />
                        )}
                      />
                    </LayoutRow>
                  );
                })}
                <CustomRowWrapper
                  highestBlock={highestBlock}
                  onBlockHeight={handleHighestBlock}
                  nodeRadio={nodeRadio}
                />
              </div>
            </div>
          </RadioGroup>
          <div className="mt-4">
            <Button
              fill={true}
              onClick={() => {
                setUrl(nodeRadio);
              }}
              data-testid="connect"
            >
              {t('Connect to this node')}
            </Button>
          </div>
        </div>
      )}
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
      <LayoutCell
        label={t('Response time')}
        // isLoading={data.responseTime?.isLoading}
        // hasError={data.responseTime?.hasError}
        // dataTestId="response-time-cell"
      >
        {time ? time.toFixed(2) + 'ms' : 'n/a'}
      </LayoutCell>
      <LayoutCell
        label={t('Block')}
        // isLoading={data.block?.isLoading}
        // hasError={
        //   data.block?.hasError ||
        //   (!!data.block?.value && highestBlock > data.block.value)
        // }
        // dataTestId="block-cell"
      >
        {data?.statistics.blockHeight || '-'}
      </LayoutCell>
      <LayoutCell
        label={t('Subscription')}
        // isLoading={data.subscription?.isLoading}
        // hasError={data.subscription?.hasError}
        // dataTestId="subscription-cell"
      >
        {headers?.blockHeight || '-'}
      </LayoutCell>
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
  const [customUrlText, setCustomUrlText] = useState('');
  const [displayCustom, setDisplayCustom] = useState(false);

  return (
    <LayoutRow>
      <div className="flex w-full mb-2">
        <Radio
          id="node-url-custom"
          value={CUSTOM_NODE_KEY}
          label={nodeRadio === CUSTOM_NODE_KEY ? '' : t('Other')}
        />
        {nodeRadio === CUSTOM_NODE_KEY && (
          <div
            data-testid="custom-node"
            className="flex items-center w-full gap-2"
          >
            <Input
              placeholder="https://"
              value={customUrlText}
              onChange={(e) => {
                setDisplayCustom(false);
                setCustomUrlText(e.target.value);
              }}
            />
            <ButtonLink
              onClick={() => {
                if (!isValidUrl(customUrlText)) {
                  return;
                }
                setDisplayCustom(true);
              }}
            >
              {t('Check')}
            </ButtonLink>
          </div>
        )}
      </div>
      {displayCustom ? (
        <ClientWrapper
          url={customUrlText}
          renderChildren={(client) => (
            <RowData
              client={client}
              url={customUrlText}
              onBlockHeight={onBlockHeight}
              highestBlock={highestBlock}
            />
          )}
        />
      ) : null}
    </LayoutRow>
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
