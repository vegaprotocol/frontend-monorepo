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

export const NodeSwitcher = ({ closeDialog }: { closeDialog: () => void }) => {
  const t = useT();
  const { nodes, setUrl, status, VEGA_ENV, VEGA_URL } = useEnvironment(
    (store) => ({
      status: store.status,
      nodes: store.nodes,
      setUrl: store.setUrl,
      VEGA_ENV: store.VEGA_ENV,
      VEGA_URL: store.VEGA_URL,
    })
  );

  const [nodeRadio, setNodeRadio] = useState<string>(() => {
    if (VEGA_URL) {
      return VEGA_URL;
    }
    return nodes.length > 0 ? '' : CUSTOM_NODE_KEY;
  });
  const [highestBlock, setHighestBlock] = useState<number | null>(null);
  const [customUrlText, setCustomUrlText] = useState('');

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
  } else if (nodeRadio === VEGA_URL) {
    isDisabled = true;
  } else if (nodeRadio === CUSTOM_NODE_KEY) {
    if (!isValidUrl(customUrlText)) {
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
              `This app will only work on ${VEGA_ENV}. Select a node to connect to.`
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
              <div>
                {nodes.map((node, index) => {
                  return (
                    <LayoutRow key={node} dataTestId="node-row">
                      <ApolloWrapper url={node}>
                        <RowData
                          id={index.toString()}
                          url={node}
                          highestBlock={highestBlock}
                          onBlockHeight={handleHighestBlock}
                        />
                      </ApolloWrapper>
                    </LayoutRow>
                  );
                })}
                <CustomRowWrapper
                  inputText={customUrlText}
                  setInputText={setCustomUrlText}
                  nodes={nodes}
                  highestBlock={highestBlock}
                  onBlockHeight={handleHighestBlock}
                  nodeRadio={nodeRadio}
                />
              </div>
            </div>
          </TradingRadioGroup>
          <div className="mt-4">
            <Button
              fill={true}
              disabled={isDisabled}
              onClick={() => {
                if (nodeRadio === CUSTOM_NODE_KEY) {
                  setUrl(customUrlText);
                } else {
                  setUrl(nodeRadio);
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
  inputText: string;
  setInputText: (text: string) => void;
  nodes: string[];
  highestBlock: number | null;
  nodeRadio: string;
  onBlockHeight: (blockHeight: number) => void;
}

const CustomRowWrapper = ({
  inputText,
  setInputText,
  nodes,
  highestBlock,
  nodeRadio,
  onBlockHeight,
}: CustomRowWrapperProps) => {
  const t = useT();
  const [displayCustom, setDisplayCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showInput = nodeRadio === CUSTOM_NODE_KEY || nodes.length <= 0;

  return (
    <LayoutRow dataTestId="custom-row">
      <div className="flex w-full mb-2">
        {nodes.length > 0 && (
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
            <TradingInput
              placeholder="https://"
              value={inputText}
              hasError={Boolean(error)}
              onChange={(e) => {
                setDisplayCustom(false);
                setInputText(e.target.value);
              }}
            />
            <ButtonLink
              onClick={() => {
                if (!isValidUrl(inputText)) {
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
        <ApolloWrapper url={inputText}>
          <RowData
            id={CUSTOM_NODE_KEY}
            url={inputText}
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
