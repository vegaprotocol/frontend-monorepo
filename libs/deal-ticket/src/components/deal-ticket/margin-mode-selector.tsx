import { useDataProvider } from '@vegaprotocol/data-provider';
import { Intent, TradingButton } from '@vegaprotocol/ui-toolkit';
import { marginModeDataProvider } from '@vegaprotocol/positions';
import { MarginMode, useVegaWallet } from '@vegaprotocol/wallet';
import * as Types from '@vegaprotocol/types';
import { useVegaTransactionStore } from '@vegaprotocol/web3';

export const MarginModeSelector = ({ marketId }: { marketId: string }) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const { data: marginMode } = useDataProvider({
    dataProvider: marginModeDataProvider,
    variables: {
      partyId: pubKey || '',
      marketId,
    },
    skip: !pubKey,
  });
  const create = useVegaTransactionStore((state) => state.create);
  const disabled = isReadOnly;

  return (
    <div className="grid grid-cols-2 gap-2 mb-2">
      <TradingButton
        disabled={disabled}
        size="extra-small"
        onClick={() =>
          create({
            updateMarginMode: {
              market_id: marketId,
              mode: MarginMode.MARGIN_MODE_CROSS_MARGIN,
            },
          })
        }
        intent={
          !marginMode ||
          marginMode.marginMode === Types.MarginMode.MARGIN_MODE_CROSS_MARGIN
            ? Intent.Primary
            : Intent.None
        }
      >
        Cross
      </TradingButton>
      <TradingButton
        disabled={disabled}
        size="extra-small"
        onClick={() =>
          create({
            updateMarginMode: {
              market_id: marketId,
              mode: MarginMode.MARGIN_MODE_ISOLATED_MARGIN,
              marginFactor: '0.1',
            },
          })
        }
        intent={
          marginMode?.marginMode ===
          Types.MarginMode.MARGIN_MODE_ISOLATED_MARGIN
            ? Intent.Primary
            : Intent.None
        }
      >
        Isolated {marginMode?.margin_factor || '10'}x
      </TradingButton>
    </div>
  );
};
