import { DocsLinks } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useExternalTwap } from '@vegaprotocol/markets';
import { PriceCell } from '@vegaprotocol/datagrid';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { HeaderStat } from '../../../components/header';
import { useT } from '../../../lib/use-t';

export const IndexPriceStat = ({
  marketId,
  assetDecimals,
}: {
  marketId: string;
  assetDecimals: number;
}) => {
  const t = useT();

  return (
    <HeaderStat
      heading={`${t('Index Price')}`}
      description={
        <div className="p1">
          {t(
            'The external time weighted average price (TWAP) received from the data source defined in the data sourcing specification.'
          )}
          {DocsLinks && (
            <ExternalLink href={DocsLinks.ETH_DATA_SOURCES} className="mt-2">
              {t('Find out more')}
            </ExternalLink>
          )}
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
  const { data: externalTwap } = useExternalTwap(marketId);
  return externalTwap && decimalPlaces ? (
    <PriceCell
      value={Number(externalTwap)}
      valueFormatted={addDecimalsFormatNumber(externalTwap, decimalPlaces)}
    />
  ) : (
    '-'
  );
};
