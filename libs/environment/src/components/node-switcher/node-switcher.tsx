import { useCallback, useState } from 'react';
import { isValidUrl } from '@vegaprotocol/utils';
import {
  Button,
  ButtonLink,
  TradingInput,
  Loader,
  TradingRadio,
  TradingRadioGroup,
} from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '../../hooks';
import { CUSTOM_NODE_KEY } from '../../types';
import { LayoutCell } from './layout-cell';
import { LayoutRow } from './layout-row';
import { ApolloWrapper } from './apollo-wrapper';
import { RowData } from './row-data';
import { useT } from '../../use-t';
import { type ApiNode } from '../../utils/validate-environment';

export const NodeSwitcher = ({ closeDialog }: { closeDialog: () => void }) => {
  const t = useT();
  const { nodes, setApiNode, status, VEGA_ENV, API_NODE } = useEnvironment(
    (store) => ({
      status: store.status,
      nodes: store.nodes,
      setApiNode: store.setApiNode,
      VEGA_ENV: store.VEGA_ENV,
      API_NODE: store.API_NODE,
    })
  );

  const [nodeRadio, setNodeRadio] = useState<string>(() => {
    if (API_NODE) {
      return API_NODE.graphQLApiUrl;
    }
    return nodes.length > 0 ? '' : CUSTOM_NODE_KEY;
  });
  const [highestBlock, setHighestBlock] = useState<number | null>(null);
  const [customGraphQLText, setCustomGraphQLText] = useState('');
  const [customRestApiText, setCustomRestApiText] = useState('');

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

  let isDisabled = false;
  if (nodeRadio === '') {
    isDisabled = true;
  } else if (nodeRadio === API_NODE?.graphQLApiUrl) {
    isDisabled = true;
  } else if (nodeRadio === CUSTOM_NODE_KEY) {
    if (!isValidUrl(customGraphQLText) || !isValidUrl(customRestApiText)) {
      isDisabled = true;
    }
  }

  return (
    <div>
      <h3 className="uppercase text-xl calt text-center mb-2">
        {t('Connected node')}
      </h3>
      {status === 'pending' ? (
        <div className="py-8">
          <p className="mb-4 text-center">{t('Loading configuration...')}</p>
          <Loader size="large" />
        </div>
      ) : (
        <div>
          <p className="mb-2 text-sm text-center">
            {t(
              'This app will only work on {{VEGA_ENV}}. Select a node to connect to.',
              { VEGA_ENV }
            )}
          </p>
          <TradingRadioGroup
            value={nodeRadio}
            onChange={(value) => setNodeRadio(value)}
          >
            <div className="hidden lg:block">
              <LayoutRow>
                <span>{t('Node')}</span>
                <span className="text-right">{t('Response time')}</span>
                <span className="text-right">{t('Block')}</span>
                <span className="text-right">{t('Subscription')}</span>
              </LayoutRow>
            </div>
            <div>
              {nodes.map((node, index) => {
                return (
                  <LayoutRow key={node.graphQLApiUrl} dataTestId="node-row">
                    <ApolloWrapper url={node.graphQLApiUrl}>
                      <RowData
                        id={index.toString()}
                        url={node.graphQLApiUrl}
                        highestBlock={highestBlock}
                        onBlockHeight={handleHighestBlock}
                      />
                    </ApolloWrapper>
                  </LayoutRow>
                );
              })}
              <CustomRowWrapper
                graphQLApiUrl={customGraphQLText}
                setGraphQLApiUrl={setCustomGraphQLText}
                restApiUrl={customRestApiText}
                setRestApiUrl={setCustomRestApiText}
                nodeCount={nodes.length}
                highestBlock={highestBlock}
                onBlockHeight={handleHighestBlock}
                nodeRadio={nodeRadio}
              />
            </div>
          </TradingRadioGroup>
          <div className="mt-4">
            <Button
              fill={true}
              disabled={isDisabled}
              onClick={() => {
                if (nodeRadio === CUSTOM_NODE_KEY) {
                  const apiNode: ApiNode = {
                    graphQLApiUrl: customGraphQLText,
                    restApiUrl: customRestApiText,
                  };
                  setApiNode(apiNode);
                } else {
                  const apiNode = nodes.find(
                    (n) => n.graphQLApiUrl === nodeRadio
                  );
                  if (apiNode) {
                    setApiNode(apiNode);
                  }
                }
                closeDialog();
              }}
              data-testid="connect"
            >
              {t('Connect to this node')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

interface CustomRowWrapperProps {
  graphQLApiUrl: string;
  setGraphQLApiUrl: (text: string) => void;
  restApiUrl: string;
  setRestApiUrl: (text: string) => void;
  nodeCount: number;
  highestBlock: number | null;
  nodeRadio: string;
  onBlockHeight: (blockHeight: number) => void;
}

const CustomRowWrapper = ({
  graphQLApiUrl,
  setGraphQLApiUrl,
  restApiUrl,
  setRestApiUrl,
  nodeCount,
  highestBlock,
  nodeRadio,
  onBlockHeight,
}: CustomRowWrapperProps) => {
  const t = useT();
  const [displayCustom, setDisplayCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showInput = nodeRadio === CUSTOM_NODE_KEY || nodeCount <= 0;

  return (
    <LayoutRow dataTestId="custom-row">
      <div className="flex w-full mb-2">
        {nodeCount > 0 && (
          <TradingRadio
            id="node-url-custom"
            value={CUSTOM_NODE_KEY}
            label={nodeRadio === CUSTOM_NODE_KEY ? '' : t('Other')}
          />
        )}
        {showInput && (
          <div
            data-testid="custom-node"
            className="flex items-center w-full gap-2"
          >
            {/** TODO: Better form */}
            <TradingInput
              data-testid="gql-input"
              placeholder="https://"
              value={graphQLApiUrl}
              hasError={Boolean(error)}
              onChange={(e) => {
                setDisplayCustom(false);
                setGraphQLApiUrl(e.target.value);
              }}
            />
            <TradingInput
              data-testid="rest-input"
              placeholder="https://"
              value={restApiUrl}
              hasError={Boolean(error)}
              onChange={(e) => {
                setDisplayCustom(false);
                setRestApiUrl(e.target.value);
              }}
            />
            <ButtonLink
              onClick={() => {
                if (!isValidUrl(graphQLApiUrl) || !isValidUrl(restApiUrl)) {
                  setError('Invalid url');
                  return;
                }
                setError(null);
                setDisplayCustom(true);
              }}
            >
              {t('Check')}
            </ButtonLink>
          </div>
        )}
      </div>
      {displayCustom ? (
        <ApolloWrapper url={graphQLApiUrl}>
          <RowData
            id={CUSTOM_NODE_KEY}
            url={graphQLApiUrl}
            onBlockHeight={onBlockHeight}
            highestBlock={highestBlock}
          />
        </ApolloWrapper>
      ) : (
        <>
          <LayoutCell
            label={t('Response time')}
            isLoading={false}
            hasError={false}
            dataTestId="response-time-cell"
          >
            {'-'}
          </LayoutCell>
          <LayoutCell
            label={t('Block')}
            isLoading={false}
            hasError={false}
            dataTestId="block-height-cell"
          >
            {'-'}
          </LayoutCell>
          <LayoutCell
            label={t('Subscription')}
            isLoading={false}
            hasError={false}
            dataTestId="subscription -cell"
          >
            {'-'}
          </LayoutCell>
        </>
      )}
    </LayoutRow>
  );
};
