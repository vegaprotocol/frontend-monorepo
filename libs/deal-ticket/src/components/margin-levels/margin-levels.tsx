import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import { Tooltip } from '@vegaprotocol/ui-toolkit';

export interface MarginLevels {
  initialLevel?: string;
  searchLevel?: string;
  maintenanceLevel?: string;
  collateralReleaseLevel?: string;
}

export const MarginBreakdown = ({
  marginLevels,
  assetDecimalPlaces,
  assetSymbol,
}: {
  marginLevels?: MarginLevels;
  assetDecimalPlaces: number;
  assetSymbol: string;
}) => {
  if (!marginLevels) return null;
  const formatNumberWithAssetDp = (value: string | number | null | undefined) =>
    value && !isNaN(Number(value))
      ? `${addDecimalsFormatNumber(value, assetDecimalPlaces)} ${assetSymbol}`
      : '-';

  return (
    <dl className="grid grid-cols-8">
      <Tooltip
        description={t(
          'This is the minimum margin required for a party to place a new order on the network'
        )}
      >
        {<dt className="col-span-3">{t('Initial level')}</dt>}
      </Tooltip>
      <dd className="text-right col-span-5">
        {formatNumberWithAssetDp(marginLevels.initialLevel)}
      </dd>
      <Tooltip
        description={t(
          'If the margin is between maintenance and search, the network will initiate a collateral search'
        )}
      >
        {<dt className="col-span-3">{t('Search level')}</dt>}
      </Tooltip>
      <dd className="text-right col-span-5">
        {formatNumberWithAssetDp(marginLevels.searchLevel)}
      </dd>
      <Tooltip
        description={t(
          'Minimal margin for the position to be maintained in the network'
        )}
      >
        {<dt className="col-span-3">{t('Maintenance level')}</dt>}
      </Tooltip>
      <dd className="text-right col-span-5">
        {formatNumberWithAssetDp(marginLevels.maintenanceLevel)}
      </dd>
      <Tooltip
        description={t(
          'If the margin of the party is greater than this level, then collateral will be released from the margin account into the general account of the party for the given asset.'
        )}
      >
        {<dt className="col-span-3">{t('Collateral release level')}</dt>}
      </Tooltip>
      <dd className="text-right col-span-5">
        {formatNumberWithAssetDp(marginLevels.collateralReleaseLevel)}
      </dd>
    </dl>
  );
};
