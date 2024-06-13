import { useDataProvider } from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';
import {
  TradingButton as Button,
  TradingInput as Input,
  FormGroup,
  LeverageSlider,
  Notification,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import { MarginMode } from '@vegaprotocol/wallet';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import * as Types from '@vegaprotocol/types';
import {
  type VegaTransactionStore,
  useVegaTransactionStore,
} from '@vegaprotocol/web3';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { useEffect, useState } from 'react';
import { useT } from '../../use-t';
import classnames from 'classnames';
import {
  marginModeDataProvider,
  useAccountBalance,
  useMarginAccountBalance,
} from '@vegaprotocol/accounts';
import { useMaxLeverage, useOpenVolume } from '@vegaprotocol/positions';
import { useActiveOrders } from '@vegaprotocol/orders';
import { usePositionEstimate } from '../../hooks/use-position-estimate';
import { addDecimalsFormatNumberQuantum } from '@vegaprotocol/utils';
import { getAsset, useMarket } from '@vegaprotocol/markets';
import { NoWalletWarning } from './deal-ticket';
import { DealTicketMarginDetails } from './deal-ticket-margin-details';

const defaultLeverage = 10;

export const MarginChange = ({
  partyId,
  marketId,
  marginMode,
  marginFactor,
}: {
  partyId: string | undefined;
  marketId: string;
  marginMode: Types.MarginMode;
  marginFactor: string;
}) => {
  const t = useT();
  const { data: market } = useMarket(marketId);
  const asset = market && getAsset(market);
  const {
    marginAccountBalance,
    orderMarginAccountBalance,
    loading: marginAccountBalanceLoading,
  } = useMarginAccountBalance(marketId);
  const {
    accountBalance: generalAccountBalance,
    loading: generalAccountBalanceLoading,
  } = useAccountBalance(asset?.id);
  const { openVolume, averageEntryPrice } = useOpenVolume(
    partyId,
    marketId
  ) || {
    openVolume: '0',
    averageEntryPrice: '0',
  };
  const { data: activeOrders } = useActiveOrders(partyId, marketId);
  const orders = activeOrders
    ? activeOrders.map<Schema.OrderInfo>((order) => ({
        isMarketOrder: order.type === Schema.OrderType.TYPE_MARKET,
        price: order.price,
        remaining: order.remaining,
        side: order.side,
      }))
    : [];
  const skip =
    (!orders?.length && openVolume === '0') ||
    marginAccountBalanceLoading ||
    generalAccountBalanceLoading;
  const estimateMargin = usePositionEstimate(
    {
      generalAccountBalance: generalAccountBalance || '0',
      marginAccountBalance: marginAccountBalance || '0',
      marginFactor,
      marginMode,
      averageEntryPrice,
      openVolume,
      marketId,
      orderMarginAccountBalance: orderMarginAccountBalance || '0',
      includeRequiredPositionMarginInAvailableCollateral: true,
      orders,
    },
    skip
  );
  if (!asset || !estimateMargin?.estimatePosition) {
    return null;
  }
  const collateralIncreaseEstimate = BigInt(
    estimateMargin.estimatePosition.collateralIncreaseEstimate.bestCase
  );

  let positionWarning = '';
  let marginChangeWarning = '';
  if (collateralIncreaseEstimate) {
    if (orders?.length && openVolume !== '0') {
      positionWarning = t(
        'youHaveOpenPositionAndOrders',
        'You have an existing position and open orders on this market.',
        {
          count: orders.length,
        }
      );
    } else if (!orders?.length) {
      positionWarning = t('You have an existing position on this market.');
    } else {
      positionWarning = t(
        'youHaveOpenOrders',
        'You have open orders on this market.',
        {
          count: orders.length,
        }
      );
    }

    const isCollateralIncreased = collateralIncreaseEstimate > BigInt(0);
    const amount = addDecimalsFormatNumberQuantum(
      collateralIncreaseEstimate.toString().replace('-', ''),
      asset?.decimals,
      asset?.quantum
    );
    const { symbol } = asset;
    const interpolation = { amount, symbol };
    if (marginMode === Schema.MarginMode.MARGIN_MODE_CROSS_MARGIN) {
      marginChangeWarning = isCollateralIncreased
        ? t(
            'Changing the margin mode will move {{amount}} {{symbol}} from your general account to fund the position.',
            interpolation
          )
        : t(
            'Changing the margin mode will release {{amount}} {{symbol}} to your general account.',
            interpolation
          );
    } else {
      marginChangeWarning = isCollateralIncreased
        ? t(
            'Changing the margin mode and leverage will move {{amount}} {{symbol}} from your general account to fund the position.',
            interpolation
          )
        : t(
            'Changing the margin mode and leverage will release {{amount}} {{symbol}} to your general account.',
            interpolation
          );
    }
  }
  return (
    <div className="mb-2">
      {positionWarning && marginChangeWarning && (
        <Notification
          intent={Intent.Warning}
          message={
            <>
              <p>{positionWarning}</p>
              <p>{marginChangeWarning}</p>
            </>
          }
        />
      )}
      <DealTicketMarginDetails
        marginAccountBalance={marginAccountBalance}
        generalAccountBalance={generalAccountBalance}
        orderMarginAccountBalance={orderMarginAccountBalance}
        asset={asset}
        market={market}
        positionEstimate={estimateMargin.estimatePosition}
        side={
          openVolume.startsWith('-')
            ? Schema.Side.SIDE_SELL
            : Schema.Side.SIDE_BUY
        }
      />
    </div>
  );
};

interface MarginDialogProps {
  open: boolean;
  onClose: () => void;
  marketId: string;
  create: VegaTransactionStore['create'];
}

const CrossMarginModeDialog = ({
  open,
  onClose,
  marketId,
  create,
}: MarginDialogProps) => {
  const { pubKey: partyId, isReadOnly } = useVegaWallet();
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
      <MarginChange
        marketId={marketId}
        partyId={partyId}
        marginMode={Types.MarginMode.MARGIN_MODE_CROSS_MARGIN}
        marginFactor="1"
      />
      <NoWalletWarning noWalletConnected={!partyId} isReadOnly={isReadOnly} />
      <Button
        className="w-full"
        data-testid="confirm-cross-margin-mode"
        onClick={() => {
          partyId &&
            !isReadOnly &&
            create({
              updateMarginMode: {
                marketId,
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
                mode: MarginMode.MARGIN_MODE_ISOLATED_MARGIN,
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
          marginMode={Types.MarginMode.MARGIN_MODE_ISOLATED_MARGIN}
          marginFactor={`${1 / leverage}`}
        />
        <NoWalletWarning noWalletConnected={!partyId} isReadOnly={isReadOnly} />
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

export const MarginModeSelector = ({ marketId }: { marketId: string }) => {
  const t = useT();
  const [dialog, setDialog] = useState<'cross' | 'isolated' | ''>();
  const { pubKey: partyId } = useVegaWallet();
  const { data: margin } = useDataProvider({
    dataProvider: marginModeDataProvider,
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
  const onClose = () => setDialog(undefined);
  const enabledModeClassName = 'bg-vega-clight-500 dark:bg-vega-cdark-500';

  return (
    <>
      <div className="mb-4 grid h-8 leading-8 font-alpha text-xs grid-cols-2">
        <button
          type="button"
          data-testid="cross-margin"
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
          type="button"
          data-testid="isolated-margin"
          onClick={() => setDialog('isolated')}
          className={classnames('rounded', {
            [enabledModeClassName]:
              marginMode === Types.MarginMode.MARGIN_MODE_ISOLATED_MARGIN,
          })}
        >
          {t('Isolated {{leverage}}x', {
            leverage: marginFactor
              ? (1 / Number(marginFactor)).toFixed(1)
              : defaultLeverage,
          })}
        </button>
      </div>
      {
        <CrossMarginModeDialog
          open={dialog === 'cross'}
          onClose={onClose}
          marketId={marketId}
          create={create}
        />
      }
      {
        <IsolatedMarginModeDialog
          open={dialog === 'isolated'}
          onClose={onClose}
          marketId={marketId}
          create={create}
          marginFactor={marginFactor || `${1 / defaultLeverage}`}
        />
      }
    </>
  );
};
