import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useMarginMode } from '@vegaprotocol/accounts';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { IsolatedDialog } from './isolated-dialog';
import { CrossDialog } from './cross-dialog';
import { MarginMode } from '@vegaprotocol/types';
import { useT } from '../../lib/use-t';
import { isSpot, useMarket } from '@vegaprotocol/markets';

const DEFAULT_LEVERAGE = 10;

export const MarginModeToggle = () => {
  const params = useParams<{ marketId: string }>();

  const [dialog, setDialog] = useState<MarginMode>();
  const { pubKey: partyId } = useVegaWallet();
  const { data: market } = useMarket(params.marketId);
  const { data: margin } = useMarginMode({
    partyId,
    marketId: params.marketId,
  });

  const create = useVegaTransactionStore((state) => state.create);

  if (!market) return null;
  if (isSpot(market.tradableInstrument.instrument.product)) return null;

  const marginMode = margin?.marginMode || MarginMode.MARGIN_MODE_CROSS_MARGIN;

  // Margin factor can be 0, we need to check for this to
  // avoid dividing by 0
  const marginFactor =
    margin?.marginFactor && margin?.marginFactor !== '0'
      ? margin.marginFactor
      : undefined;

  const onClose = () => setDialog(undefined);

  return (
    <>
      <Toggle
        mode={marginMode}
        factor={marginFactor}
        onValueChange={(mode) => {
          if (mode === '') return;
          setDialog(mode as MarginMode);
        }}
      />
      <CrossDialog
        open={dialog === MarginMode.MARGIN_MODE_CROSS_MARGIN}
        onClose={onClose}
        marketId={market.id}
        create={create}
      />
      <IsolatedDialog
        open={dialog === MarginMode.MARGIN_MODE_ISOLATED_MARGIN}
        onClose={onClose}
        marketId={market.id}
        create={create}
        marginFactor={marginFactor || `${1 / DEFAULT_LEVERAGE}`}
      />
    </>
  );
};

const Toggle = ({
  mode,
  factor,
  onValueChange,
}: {
  mode: MarginMode;
  factor?: string;
  onValueChange: (value: string) => void;
}) => {
  const t = useT();
  const itemClass =
    'relative py-0.5 px-2 text-xs  data-[state=on]:text-vega-clight-900 data-[state=on]:dark:text-vega-cdark-900';
  const indicator = (
    <span className="absolute top-0 right-0 bottom-0 left-0 bg-vega-cdark-500 dark:bg-vega-clight-500 rounded" />
  );

  return (
    <ToggleGroup.Root
      type="single"
      value={mode}
      className="inline-flex rounded bg-vega-clight-500 dark:bg-vega-cdark-500"
    >
      <ToggleGroup.Item
        value={MarginMode.MARGIN_MODE_CROSS_MARGIN}
        className={itemClass}
        onClick={() => onValueChange(MarginMode.MARGIN_MODE_CROSS_MARGIN)}
        data-testid="cross-margin"
      >
        {mode === MarginMode.MARGIN_MODE_CROSS_MARGIN && indicator}
        <span className="relative">{t('Cross')}</span>
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value={MarginMode.MARGIN_MODE_ISOLATED_MARGIN}
        className={itemClass}
        onClick={() => onValueChange(MarginMode.MARGIN_MODE_ISOLATED_MARGIN)}
        data-testid="isolated-margin"
      >
        {mode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN && indicator}
        {mode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN ? (
          <span className="relative flex items-center gap-1">
            {t('Isolated')}:
            <Leverage factor={factor} />
          </span>
        ) : (
          <span className="relative">{t('Isolated')}</span>
        )}
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
};

const Leverage = ({ factor }: { factor: string | undefined }) => {
  let leverage = DEFAULT_LEVERAGE.toString();

  if (factor && factor !== '0') {
    leverage = (1 / Number(factor)).toFixed(1);
  }

  return <span>{leverage}x</span>;
};
