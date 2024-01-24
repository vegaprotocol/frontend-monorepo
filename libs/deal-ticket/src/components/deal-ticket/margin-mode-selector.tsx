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
import {
  marginModeDataProvider,
  useAccountBalance,
  useMarginAccountBalance,
} from '@vegaprotocol/accounts';
import { useMaxLeverage, useOpenVolume } from '@vegaprotocol/positions';
import { activeOrdersProvider } from '@vegaprotocol/orders';
import { usePositionEstimate } from '../../hooks/use-position-estimate';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { getAsset, useMarket } from '@vegaprotocol/markets';

const defaultLeverage = 10;

export const MarginChange = ({
  partyId,
  marketId,
  marginMode,
  marginFactor,
}: {
  partyId: string;
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
  const { data: activeOrders } = useDataProvider({
    dataProvider: activeOrdersProvider,
    variables: { partyId: partyId || '', marketId },
  });
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
      includeCollateralIncreaseInAvailableCollateral: true,
      orders,
    },
    skip
  );
  if (
    !asset ||
    !estimateMargin?.estimatePosition?.collateralIncreaseEstimate.worstCase ||
    estimateMargin.estimatePosition.collateralIncreaseEstimate.worstCase === '0'
  ) {
    return null;
  }
  const diff = BigInt(
    estimateMargin.estimatePosition.collateralIncreaseEstimate.worstCase
  );
  if (!diff) {
    return null;
  }
  let positionWarning = '';
  if (orders?.length || openVolume) {
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
  let marginChangeWarning = '';
  const amount = addDecimalsFormatNumber(
    diff.toString().replace(/^-/, ''),
    asset?.decimals
  );
  const { symbol } = asset;
  const interpolation = { amount, symbol };
  const release = diff < BigInt(0);
  if (marginMode === Schema.MarginMode.MARGIN_MODE_CROSS_MARGIN) {
    if (release) {
      marginChangeWarning = t(
        'Changing to this margin mode will result in {{amount}} {{symbol}} will be released to your general account.',
        interpolation
      );
    } else {
      marginChangeWarning = t(
        'Changing to this margin mode will result in {{amount}} {{symbol}} will be moved from your general account to fund the position.',
        interpolation
      );
    }
  } else {
    if (release) {
      marginChangeWarning = t(
        'Changing to this margin mode and leverage will result in {{amount}} {{symbol}} will be released to your general account.',
        interpolation
      );
    } else {
      marginChangeWarning = t(
        'Changing to this margin mode and leverage will result in {{amount}} {{symbol}} will be moved from your general account to fund the position.',
        interpolation
      );
    }
  }
  return (
    <div className="mb-2">
      <Notification
        intent={Intent.Warning}
        message={
          <>
            <p>{positionWarning}</p>
            <p>{marginChangeWarning}</p>
          </>
        }
      />
    </div>
  );
};

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
  partyId,
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
      <MarginChange
        marketId={marketId}
        partyId={partyId}
        marginMode={Types.MarginMode.MARGIN_MODE_CROSS_MARGIN}
        marginFactor="1"
      />
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
  partyId,
  marginFactor,
  create,
}: MarginDialogProps & { marginFactor: string }) => {
  const [leverage, setLeverage] = useState(
    Number((1 / Number(marginFactor)).toFixed(1))
  );
  const { data: maxLeverage } = useMaxLeverage(marketId, partyId);
  const max = Math.floor((maxLeverage || 1) * 10) / 10;
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
          create({
            updateMarginMode: {
              market_id: marketId,
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
              step={0.1}
              value={[leverage]}
              onValueChange={([value]) => setLeverage(value)}
            />
          </div>
          <Input
            type="number"
            id="leverage-input"
            min={1}
            max={max}
            step={0.1}
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
          />
        </FormGroup>
        <MarginChange
          marketId={marketId}
          partyId={partyId}
          marginMode={Types.MarginMode.MARGIN_MODE_ISOLATED_MARGIN}
          marginFactor={`${1 / leverage}`}
        />
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
    dataProvider: marginModeDataProvider,
    variables: {
      partyId: partyId || '',
      marketId,
    },
    skip: !partyId,
  });
  useEffect(() => {
    if (!partyId) {
      setDialog('');
    }
  }, [partyId]);
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
          onClick={() => partyId && setDialog('cross')}
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
            leverage: marginFactor
              ? (1 / Number(marginFactor)).toFixed(1)
              : defaultLeverage,
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
