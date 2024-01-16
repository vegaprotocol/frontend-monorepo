import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  TradingButton as Button,
  TradingInput as Input,
  FormGroup,
} from '@vegaprotocol/ui-toolkit';
import { MarginMode, useVegaWallet } from '@vegaprotocol/wallet';
import * as Types from '@vegaprotocol/types';
import {
  type VegaTransactionStore,
  useVegaTransactionStore,
} from '@vegaprotocol/web3';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { useEffect, useState } from 'react';
import { useT } from '../../use-t';
import classnames from 'classnames';
import { marketMarginDataProvider } from '@vegaprotocol/accounts';

const defaultLeverage = 10;
interface MarginDialogProps {
  open: boolean;
  onClose: () => void;
  marketId: string;
  partyId: string;
  create: VegaTransactionStore['create'];
}

const CrossMarginModeDialog = ({
  open,
  onClose,
  marketId,
  create,
}: MarginDialogProps) => {
  const t = useT();
  return (
    <Dialog
      title={t('Cross margin')}
      size="small"
      open={open}
      onChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <div className="text-sm mb-4">
        <p className="mb-1">
          {t('You are setting this market to cross-margin mode.')}
        </p>
        <p className="mb-1">
          {t(
            'Your max leverage on each position will be determined by the risk model of the market.'
          )}
        </p>
        <p>
          {t(
            'All available funds in your general account will be used to finance your margin if the market moves against you.'
          )}
        </p>
      </div>
      <Button
        className="w-full"
        onClick={() => {
          create({
            updateMarginMode: {
              market_id: marketId,
              mode: MarginMode.MARGIN_MODE_CROSS_MARGIN,
            },
          });
          onClose();
        }}
      >
        {t('Confirm')}
      </Button>
    </Dialog>
  );
};

const IsolatedMarginModeDialog = ({
  open,
  onClose,
  marketId,
  marginFactor,
  create,
}: MarginDialogProps & { marginFactor: string }) => {
  const [leverage, setLeverage] = useState(`${1 / Number(marginFactor)}`);
  useEffect(() => {
    setLeverage(`${1 / Number(marginFactor)}`);
  }, [marginFactor]);
  const t = useT();
  return (
    <Dialog
      title={t('Isolated margin')}
      size="small"
      open={open}
      onChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <div className="text-sm mb-4">
        <p className="mb-1">
          {t('You are setting this market to isolated margin mode.')}
        </p>
        <p className="mb-1">
          {t(
            'Set the leverage you want below. The maximum leverage you can take is determined by the risk model of the market.'
          )}
        </p>
        <p className="mb-1">
          {t(
            'Only your allocated margin will be used to fund this position, and if the maintenance margin is breached you will be closed out.'
          )}
        </p>
      </div>
      <form
        onSubmit={() => {
          create({
            updateMarginMode: {
              market_id: marketId,
              mode: MarginMode.MARGIN_MODE_ISOLATED_MARGIN,
              marginFactor: `${1 / Number(leverage)}`,
            },
          });
          onClose();
        }}
      >
        <FormGroup label={t('Leverage')} labelFor="leverage-input" compact>
          <Input
            type="number"
            id="leverage-input"
            min={1}
            max={100}
            step={0.1}
            value={leverage}
            onChange={(e) => setLeverage(e.target.value)}
          />
        </FormGroup>
        <Button className="w-full" type="submit">
          {t('Confirm')}
        </Button>
      </form>
    </Dialog>
  );
};

export const MarginModeSelector = ({ marketId }: { marketId: string }) => {
  const t = useT();
  const [dialog, setDialog] = useState<'cross' | 'isolated' | ''>();
  const { pubKey: partyId, isReadOnly } = useVegaWallet();
  const { data: margin } = useDataProvider({
    dataProvider: marketMarginDataProvider,
    variables: {
      partyId: partyId || '',
      marketId,
    },
    skip: !partyId,
  });
  const create = useVegaTransactionStore((state) => state.create);
  const marginMode = margin?.marginMode;
  const marginFactor =
    margin?.marginFactor && margin?.marginFactor !== '0'
      ? margin?.marginFactor
      : undefined;
  const disabled = isReadOnly;
  const onClose = () => setDialog(undefined);
  const enabledModeClassName = 'bg-vega-clight-500 dark:bg-vega-cdark-500';

  return (
    <>
      <div className="mb-4 grid h-8 leading-8 font-alpha text-xs grid-cols-2">
        <button
          disabled={disabled}
          onClick={() => setDialog('cross')}
          className={classnames('rounded', {
            [enabledModeClassName]:
              !marginMode ||
              marginMode === Types.MarginMode.MARGIN_MODE_CROSS_MARGIN,
          })}
        >
          {t('Cross')}
        </button>
        <button
          disabled={disabled}
          onClick={() => partyId && setDialog('isolated')}
          className={classnames('rounded', {
            [enabledModeClassName]:
              marginMode === Types.MarginMode.MARGIN_MODE_ISOLATED_MARGIN,
          })}
        >
          {t('Isolated {{leverage}}x', {
            leverage: marginFactor ? 1 / Number(marginFactor) : defaultLeverage,
          })}
        </button>
      </div>
      {partyId && (
        <CrossMarginModeDialog
          partyId={partyId}
          open={dialog === 'cross'}
          onClose={onClose}
          marketId={marketId}
          create={create}
        />
      )}
      {partyId && (
        <IsolatedMarginModeDialog
          partyId={partyId}
          open={dialog === 'isolated'}
          onClose={onClose}
          marketId={marketId}
          create={create}
          marginFactor={marginFactor || `${1 / defaultLeverage}`}
        />
      )}
    </>
  );
};
