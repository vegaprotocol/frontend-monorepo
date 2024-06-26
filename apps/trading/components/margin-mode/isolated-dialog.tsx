import { MarginMode } from '@vegaprotocol/types';
import { MarginMode as MarginModeTx } from '@vegaprotocol/wallet';
import {
  TradingButton as Button,
  Dialog,
  FormGroup,
  TradingInput as Input,
  LeverageSlider,
} from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useEffect, useState } from 'react';
import { useMaxLeverage } from '@vegaprotocol/positions';
import { MarginChange } from './margin-change';

export const IsolatedDialog = ({
  open,
  onClose,
  marketId,
  marginFactor,
  create,
}: {
  open: boolean;
  onClose: () => void;
  marketId: string;
  create: (tx: {
    updateMarginMode: {
      marketId: string;
      mode: MarginModeTx;
      marginFactor: string;
    };
  }) => void;
  marginFactor: string;
}) => {
  const { pubKey: partyId, isReadOnly } = useVegaWallet();
  const [leverage, setLeverage] = useState(
    Number((1 / Number(marginFactor)).toFixed(1))
  );
  const { data: maxLeverage } = useMaxLeverage(marketId, partyId);
  const max = Math.floor((maxLeverage || 1) * 10) / 10;
  const min = 0.1;

  useEffect(() => {
    setLeverage(Number((1 / Number(marginFactor)).toFixed(1)));
  }, [marginFactor]);

  useEffect(() => {
    if (maxLeverage && leverage > max) {
      setLeverage(max);
    }
  }, [max, maxLeverage, leverage]);

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
          partyId &&
            !isReadOnly &&
            create({
              updateMarginMode: {
                marketId,
                mode: MarginModeTx.MARGIN_MODE_ISOLATED_MARGIN,
                marginFactor: `${1 / leverage}`,
              },
            });
          onClose();
        }}
      >
        <FormGroup label={t('Leverage')} labelFor="leverage-input" compact>
          <div className="mb-2">
            <LeverageSlider
              max={max}
              min={min}
              step={0.1}
              value={[leverage || 1]}
              onValueChange={([value]) => setLeverage(value)}
            />
          </div>
          <Input
            type="number"
            id="leverage-input"
            min={min}
            max={max}
            step={0.1}
            value={leverage || ''}
            onChange={(e) => setLeverage(Number(e.target.value))}
          />
        </FormGroup>
        <MarginChange
          marketId={marketId}
          partyId={partyId}
          marginMode={MarginMode.MARGIN_MODE_ISOLATED_MARGIN}
          marginFactor={`${1 / leverage}`}
        />
        {/*
        TODO: get this working
        <NoWalletWarning noWalletConnected={!partyId} isReadOnly={isReadOnly} /> */}
        <Button
          className="w-full"
          type="submit"
          data-testid="confirm-isolated-margin-mode"
        >
          {t('Confirm')}
        </Button>
      </form>
    </Dialog>
  );
};
