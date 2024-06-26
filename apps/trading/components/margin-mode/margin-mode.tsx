import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useMarginMode } from '@vegaprotocol/accounts';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import classNames from 'classnames';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVegaTransactionStore } from '@vegaprotocol/web3';
import { IsolatedDialog } from './isolated-dialog';
import { CrossDialog } from './cross-dialog';
import { MarginMode } from '@vegaprotocol/types';
import { useT } from '../../lib/use-t';

const DEFAULT_LEVERAGE = 10;

export const MarginModeToggle = () => {
  const params = useParams<{ marketId: string }>();

  const [dialog, setDialog] = useState<MarginMode>();
  const { pubKey: partyId } = useVegaWallet();

  const { data: margin } = useMarginMode({
    partyId,
    marketId: params.marketId,
  });

  const create = useVegaTransactionStore((state) => state.create);
  const marginMode = margin?.marginMode || MarginMode.MARGIN_MODE_CROSS_MARGIN;
  const marginFactor =
    margin?.marginFactor && margin?.marginFactor !== '0'
      ? margin?.marginFactor
      : undefined;
  const onClose = () => setDialog(undefined);

  if (!params.marketId) return null;

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
        marketId={params.marketId}
        // @ts-ignore TODO: fix this type
        create={create}
      />
      <IsolatedDialog
        open={dialog === MarginMode.MARGIN_MODE_ISOLATED_MARGIN}
        onClose={onClose}
        marketId={params.marketId}
        // @ts-ignore TODO: fix this type
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
  const itemClass = classNames('relative py-px px-2 text-xs', '');
  const indicator = (
    <span className="absolute -top-0.5 -right-0.5 -bottom-0.5 -left-0.5 bg-vega-clight-500 dark:bg-vega-cdark-500 rounded" />
  );
  const leverage = factor ? (1 / Number(factor)).toFixed(1) : DEFAULT_LEVERAGE;

  return (
    <ToggleGroup.Root
      type="single"
      value={mode}
      className="inline-flex rounded bg-vega-clight-800 dark:bg-vega-cdark-800"
      onValueChange={onValueChange}
    >
      <ToggleGroup.Item
        value={MarginMode.MARGIN_MODE_CROSS_MARGIN}
        className={itemClass}
      >
        {mode === MarginMode.MARGIN_MODE_CROSS_MARGIN && indicator}
        <span className="relative">Cross</span>
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value={MarginMode.MARGIN_MODE_ISOLATED_MARGIN}
        className={itemClass}
      >
        {mode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN && indicator}
        {mode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN ? (
          <span className="relative flex items-center gap-1">
            {t('Isolated')}
            <span className="py-px px-1 rounded text-2xs bg-vega-green-700 text-vega-green">
              {leverage}x
            </span>
          </span>
        ) : (
          <span className="relative">{t('Isolated')}</span>
        )}
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
};
