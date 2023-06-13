import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Tooltip, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketMarginDataProvider } from './margin-data-provider';
import { useAssetsMapProvider } from '@vegaprotocol/assets';
import { t } from '@vegaprotocol/i18n';
import { useAccountBalance } from './use-account-balance';
import { useMarketAccountBalance } from './use-market-account-balance';

const MarginHealthChartTooltipRow = ({
  label,
  value,
  decimals,
  href,
}: {
  label: string;
  value: string;
  decimals: number;
  href?: string;
}) => (
  <>
    <div
      className="float-left clear-left"
      key="label"
      data-testid="margin-health-tooltip-label"
    >
      {href ? (
        <ExternalLink href={href} target="_blank">
          {label}
        </ExternalLink>
      ) : (
        label
      )}
    </div>
    <div
      className="float-right"
      key="value"
      data-testid="margin-health-tooltip-value"
    >
      {addDecimalsFormatNumber(value, decimals)}
    </div>
  </>
);

export const MarginHealthChartTooltip = ({
  maintenanceLevel,
  searchLevel,
  initialLevel,
  collateralReleaseLevel,
  decimals,
  marginAccountBalance,
}: {
  maintenanceLevel: string;
  searchLevel: string;
  initialLevel: string;
  collateralReleaseLevel: string;
  decimals: number;
  marginAccountBalance?: string;
}) => {
  const tooltipContent = [
    <MarginHealthChartTooltipRow
      key={'maintenance'}
      label={t('maintenance level')}
      href="https://docs.vega.xyz/testnet/concepts/trading-on-vega/positions-margin#margin-level-maintenance"
      value={maintenanceLevel}
      decimals={decimals}
    />,
    <MarginHealthChartTooltipRow
      key={'search'}
      label={t('search level')}
      href="https://docs.vega.xyz/testnet/concepts/trading-on-vega/positions-margin#margin-level-searching-for-collateral"
      value={searchLevel}
      decimals={decimals}
    />,
    <MarginHealthChartTooltipRow
      key={'initial'}
      label={t('initial level')}
      href="https://docs.vega.xyz/testnet/concepts/trading-on-vega/positions-margin#margin-level-initial"
      value={initialLevel}
      decimals={decimals}
    />,
    <MarginHealthChartTooltipRow
      key={'release'}
      label={t('release level')}
      href="https://docs.vega.xyz/testnet/concepts/trading-on-vega/positions-margin#margin-level-releasing-collateral"
      value={collateralReleaseLevel}
      decimals={decimals}
    />,
  ];

  if (marginAccountBalance) {
    const balance = (
      <MarginHealthChartTooltipRow
        key={'balance'}
        label={t('balance')}
        value={marginAccountBalance}
        decimals={decimals}
      />
    );
    if (BigInt(marginAccountBalance) < BigInt(searchLevel)) {
      tooltipContent.splice(1, 0, balance);
    } else if (BigInt(marginAccountBalance) < BigInt(initialLevel)) {
      tooltipContent.splice(2, 0, balance);
    } else if (BigInt(marginAccountBalance) < BigInt(collateralReleaseLevel)) {
      tooltipContent.splice(3, 0, balance);
    } else {
      tooltipContent.push(balance);
    }
  }
  return (
    <div className="overflow-hidden" data-testid="margin-health-tooltip">
      {tooltipContent}
    </div>
  );
};

export const MarginHealthChart = ({
  marketId,
  assetId,
}: {
  marketId: string;
  assetId: string;
}) => {
  const { data: assetsMap } = useAssetsMapProvider();
  const { pubKey: partyId } = useVegaWallet();
  const { data } = useDataProvider({
    dataProvider: marketMarginDataProvider,
    variables: { marketId, partyId: partyId ?? '' },
    skip: !partyId,
  });
  const { accountBalance: rawGeneralAccountBalance } =
    useAccountBalance(assetId);
  const { accountBalance: rawMarginAccountBalance } =
    useMarketAccountBalance(marketId);
  const asset = assetsMap && assetsMap[assetId];
  if (!data || !asset) {
    return null;
  }
  const { decimals } = asset;

  const collateralReleaseLevel = Number(data.collateralReleaseLevel);
  const initialLevel = Number(data.initialLevel);
  const maintenanceLevel = Number(data.maintenanceLevel);
  const searchLevel = Number(data.searchLevel);
  const marginAccountBalance = Number(rawMarginAccountBalance || '0');
  const generalAccountBalance = Number(rawGeneralAccountBalance || '0');
  const max = Math.max(
    marginAccountBalance + generalAccountBalance,
    collateralReleaseLevel
  );

  const red = maintenanceLevel / max;
  const orange = (searchLevel - maintenanceLevel) / max;
  const yellow = ((searchLevel + initialLevel) / 2 - searchLevel) / max;
  const green = (collateralReleaseLevel - initialLevel) / max + yellow;
  const balanceMarker = marginAccountBalance / max;

  const tooltip = (
    <MarginHealthChartTooltip
      maintenanceLevel={data.maintenanceLevel}
      searchLevel={data.searchLevel}
      initialLevel={data.initialLevel}
      collateralReleaseLevel={data.collateralReleaseLevel}
      marginAccountBalance={rawMarginAccountBalance}
      decimals={decimals}
    />
  );

  return (
    <div data-testid="margin-health-chart">
      {addDecimalsFormatNumber(
        (BigInt(marginAccountBalance) - BigInt(maintenanceLevel)).toString(),
        decimals
      )}{' '}
      {t('above')}{' '}
      <ExternalLink href="https://docs.vega.xyz/testnet/concepts/trading-on-vega/positions-margin#margin-level-maintenance">
        {t('maintenance level')}
      </ExternalLink>
      <Tooltip description={tooltip}>
        <div
          data-testid="margin-health-chart-track"
          className="relative bg-vega-green-650"
          style={{
            height: '6px',
            marginBottom: '1px',
            display: 'flex',
          }}
        >
          <div
            data-testid="margin-health-chart-red"
            className="bg-vega-pink-550"
            style={{
              height: '100%',
              width: `${red * 100}%`,
            }}
          ></div>
          <div
            data-testid="margin-health-chart-orange"
            className="bg-vega-orange"
            style={{
              height: '100%',
              width: `${orange * 100}%`,
            }}
          ></div>
          <div
            data-testid="margin-health-chart-yellow"
            className="bg-vega-yellow"
            style={{
              height: '100%',
              width: `${yellow * 100}%`,
            }}
          ></div>
          <div
            data-testid="margin-health-chart-green"
            className="bg-vega-green-600"
            style={{
              height: '100%',
              width: `${green * 100}%`,
            }}
          ></div>
          {balanceMarker > 0 && balanceMarker < 100 && (
            <div
              data-testid="margin-health-chart-balance"
              className="absolute bg-vega-blue"
              style={{
                height: '8px',
                width: '8px',
                top: '-1px',
                transform: 'translate(-4px, 0px)',
                borderRadius: '50%',
                border: '1px solid white',
                backgroundColor: 'blue',
                left: `${balanceMarker * 100}%`,
              }}
            ></div>
          )}
        </div>
      </Tooltip>
    </div>
  );
};
