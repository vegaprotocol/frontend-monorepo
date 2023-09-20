import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import isUndefined from 'lodash/isUndefined';
import { useExplorerMarketQuery } from '../links/market-link/__generated__/Market';
import get from 'lodash/get';

export type DecimalSource = 'MARKET' | 'SETTLEMENT_ASSET';

export type PriceInMarketProps = {
  marketId: string;
  price: string;
  decimalSource?: DecimalSource;
};

/**
 * Given a market ID and a price it will fetch the market
 * and format the price in that market's decimal places.
 */
const PriceInMarket = ({
  marketId,
  price,
  decimalSource = 'MARKET',
}: PriceInMarketProps) => {
  const { data } = useExplorerMarketQuery({
    variables: { id: marketId },
    fetchPolicy: 'cache-first',
  });

  let label = price;

  if (data) {
    if (decimalSource === 'MARKET' && data.market?.decimalPlaces) {
      label = addDecimalsFormatNumber(price, data.market.decimalPlaces);
    } else if (
      decimalSource === 'SETTLEMENT_ASSET' &&
      data.market &&
      'settlementAsset' in data.market.tradableInstrument.instrument.product &&
      data.market?.tradableInstrument.instrument.product.settlementAsset
    ) {
      label = addDecimalsFormatNumber(
        price,
        data.market?.tradableInstrument.instrument.product.settlementAsset
          .decimals
      );
    }
  }

  const suffix = get(
    data,
    'market.tradableInstrument.instrument.product.quoteName',
    ''
  );

  if (isUndefined(price) || price === '' || price === '0') {
    return (
      <span>
        <abbr title={'Best available price'}>{t('Market')}</abbr> {suffix}
      </span>
    );
  } else {
    return (
      <label>
        <span>{label}</span> <span>{suffix}</span>
      </label>
    );
  }
};

export default PriceInMarket;
