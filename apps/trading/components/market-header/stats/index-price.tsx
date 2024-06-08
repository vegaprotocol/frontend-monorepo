import { DocsLinks, useEnvironment } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { PriceCell } from '@vegaprotocol/datagrid';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { HeaderStat } from '../../../components/header';
import { useT } from '../../../lib/use-t';
import { type Market, useMarket } from '@vegaprotocol/data-provider';

export const IndexPriceStat = ({
  marketId,
  assetDecimals,
  markPriceConfiguration,
}: {
  marketId: string;
  assetDecimals: number;
  markPriceConfiguration: Market['markPriceConfiguration'];
}) => {
  const { VEGA_EXPLORER_URL } = useEnvironment();
  const t = useT();

  const dataSourceSpec = markPriceConfiguration.dataSourcesSpec?.[1];
  const sourceType =
    dataSourceSpec?.sourceType.__typename === 'DataSourceDefinitionExternal' &&
    dataSourceSpec?.sourceType.sourceType.__typename === 'EthCallSpec' &&
    dataSourceSpec?.sourceType.sourceType;

  return (
    <HeaderStat
      heading={`${t('Index Price')}`}
      description={
        <div className="p1">
          <p>
            {t(
              'The external time weighted average price (TWAP) received from the data source defined in the data sourcing specification.'
            )}
          </p>
          <p className="flex flex-col gap-1">
            {DocsLinks && (
              <ExternalLink href={DocsLinks.ETH_DATA_SOURCES} className="mt-2">
                {t('Find out more')}
              </ExternalLink>
            )}
            {sourceType && (
              <ExternalLink
                data-testid="oracle-spec-links"
                href={`${VEGA_EXPLORER_URL}/markets/${marketId}/oracles#${sourceType.address}`}
                className="text-xs my-1"
              >
                {t('Oracle specification')}
              </ExternalLink>
            )}
          </p>
        </div>
      }
      data-testid="index-price"
    >
      <IndexPrice marketId={marketId} decimalPlaces={assetDecimals} />
    </HeaderStat>
  );
};

export const IndexPrice = ({
  marketId,
  decimalPlaces,
}: {
  marketId: string;
  decimalPlaces?: number;
}) => {
  const { data } = useMarket({ marketId });
  const externalTwap = data?.data?.productData?.externalTwap;

  return externalTwap && decimalPlaces ? (
    <PriceCell
      value={Number(externalTwap)}
      valueFormatted={addDecimalsFormatNumber(externalTwap, decimalPlaces)}
    />
  ) : (
    '-'
  );
};
