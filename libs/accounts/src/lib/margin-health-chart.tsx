import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { Tooltip, ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketMarginDataProvider } from './margin-data-provider';
import { useAssetsMapProvider } from '@vegaprotocol/assets';
import { t } from '@vegaprotocol/i18n';
import { useAccountBalance } from './use-account-balance';
import { useMarketAccountBalance } from './use-market-account-balance';

const TooltipContentRow = ({
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
    <div className="float-left clear-left" key="label">
      {href ? (
        <ExternalLink href={href} target="_blank">
          {label}
        </ExternalLink>
      ) : (
        label
      )}
    </div>
    <div className="float-right" key="value">
      {addDecimalsFormatNumber(value, decimals)}
    </div>
  </>
);

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

  const tooltipContent = [
    <TooltipContentRow
      key={'maintenance'}
      label={t('maintenance level')}
      href="https://docs.vega.xyz/testnet/concepts/trading-on-vega/positions-margin#margin-level-maintenance"
      value={data.maintenanceLevel}
      decimals={decimals}
    />,
    <TooltipContentRow
      key={'search'}
      label={t('search level')}
      href="https://docs.vega.xyz/testnet/concepts/trading-on-vega/positions-margin#margin-level-searching-for-collateral"
      value={data.searchLevel}
      decimals={decimals}
    />,
    <TooltipContentRow
      key={'initial'}
      label={t('initial level')}
      href="https://docs.vega.xyz/testnet/concepts/trading-on-vega/positions-margin#margin-level-initial"
      value={data.initialLevel}
      decimals={decimals}
    />,
    <TooltipContentRow
      key={'release'}
      label={t('release level')}
      href="https://docs.vega.xyz/testnet/concepts/trading-on-vega/positions-margin#margin-level-releasing-collateral"
      value={data.collateralReleaseLevel}
      decimals={decimals}
    />,
  ];

  if (rawMarginAccountBalance) {
    const balance = (
      <TooltipContentRow
        key={'balance'}
        label={t('balance')}
        value={rawMarginAccountBalance}
        decimals={decimals}
      />
    );
    if (BigInt(rawMarginAccountBalance) < BigInt(data.searchLevel)) {
      tooltipContent.splice(1, 0, balance);
    } else if (BigInt(rawMarginAccountBalance) < BigInt(data.initialLevel)) {
      tooltipContent.splice(2, 0, balance);
    } else if (
      BigInt(rawMarginAccountBalance) < BigInt(data.collateralReleaseLevel)
    ) {
      tooltipContent.splice(3, 0, balance);
    } else {
      tooltipContent.push(balance);
    }
  }

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
      <Tooltip
        description={<div className="overflow-hidden">{tooltipContent}</div>}
      >
        <div
          className="relative bg-vega-green-650"
          style={{
            height: '6px',
            marginBottom: '1px',
            display: 'flex',
          }}
        >
          <div
            className="bg-vega-pink-550"
            style={{
              height: '100%',
              width: `${red * 100}%`,
            }}
          ></div>
          <div
            className="bg-vega-orange"
            style={{
              height: '100%',
              width: `${orange * 100}%`,
            }}
          ></div>
          <div
            className="bg-vega-yellow"
            style={{
              height: '100%',
              width: `${yellow * 100}%`,
            }}
          ></div>
          <div
            className="bg-vega-green-600"
            style={{
              height: '100%',
              width: `${green * 100}%`,
            }}
          ></div>
          {balanceMarker > 0 && balanceMarker < 100 && (
            <div
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
