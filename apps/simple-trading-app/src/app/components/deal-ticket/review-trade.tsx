import { addDecimal, formatNumber, t } from '@vegaprotocol/react-helpers';
import {
  Button,
  Icon,
  KeyValueTable,
  KeyValueTableRow,
} from '@vegaprotocol/ui-toolkit';
import * as React from 'react';
import classNames from 'classnames';
import type { DealTicketQuery_market } from '@vegaprotocol/deal-ticket';
import type { Order } from '@vegaprotocol/orders';
import { SIDE_NAMES } from './side-selector';
import { VegaWalletOrderSide } from '@vegaprotocol/wallet';
import SimpleMarketExpires from '../simple-market-list/simple-market-expires';
import { gql, useQuery } from '@apollo/client';
import type {
  MarketTags,
  MarketTagsVariables,
} from './__generated__/MarketTags';
import { IconNames } from '@blueprintjs/icons';

export const MARKET_TAGS_QUERY = gql`
  query MarketTags($marketId: ID!) {
    market(id: $marketId) {
      tradableInstrument {
        instrument {
          metadata {
            tags
          }
        }
      }
    }
  }
`;

interface Props {
  market: DealTicketQuery_market;
  isDisabled: boolean;
  transactionStatus?: string;
  order: Order;
  estCloseOut: string;
  estMargin: string;
}

export default ({
  isDisabled,
  market,
  order,
  transactionStatus,
  estCloseOut,
  estMargin,
}: Props) => {
  const { data: tagsData } = useQuery<MarketTags, MarketTagsVariables>(
    MARKET_TAGS_QUERY,
    {
      variables: { marketId: market.id },
    }
  );

  return (
    <div className="mb-8 text-black dark:text-white">
      <KeyValueTable>
        <KeyValueTableRow noBorder>
          <div className="flex flex-none gap-x-5 items-center">
            <div
              className={classNames(
                {
                  'buyButton dark:buyButtonDark':
                    order.side === VegaWalletOrderSide.Buy,
                  'sellButton dark:sellButtonDark':
                    order.side === VegaWalletOrderSide.Sell,
                },
                'px-8 py-4 inline text-ui-small'
              )}
            >
              {SIDE_NAMES[order.side]}
            </div>
            <div>{market.tradableInstrument.instrument.product.quoteName}</div>
            <div>
              {tagsData?.market?.tradableInstrument.instrument.metadata
                .tags && (
                <SimpleMarketExpires
                  tags={
                    tagsData?.market.tradableInstrument.instrument.metadata.tags
                  }
                />
              )}
            </div>
          </div>
          <div className="text-blue">
            @{' '}
            {market.depth.lastTrade
              ? addDecimal(market.depth.lastTrade.price, market.decimalPlaces)
              : ' - '}{' '}
            <span className="text-ui-small inline">(EST)</span>
          </div>
        </KeyValueTableRow>
        <KeyValueTableRow noBorder>
          <>{t('Est. margin')}</>
          <div className="text-black dark:text-white flex gap-x-5 items-center">
            {estMargin}
            <Icon name={IconNames.ISSUE} className="rotate-180" />
          </div>
        </KeyValueTableRow>
        <KeyValueTableRow noBorder>
          <>
            {t('Size')}{' '}
            <div className="text-ui-small inline">
              ({market.tradableInstrument.instrument.product.quoteName})
            </div>
          </>
          <div className="text-black dark:text-white flex gap-x-5 items-center">
            {formatNumber(order.size, market.decimalPlaces)}
            <Icon name={IconNames.ISSUE} className="rotate-180" />
          </div>
        </KeyValueTableRow>
        <KeyValueTableRow noBorder>
          <>{t('Est. close out')}</>
          <div className="text-black dark:text-white flex gap-x-5 items-center">
            {estCloseOut}
            <Icon name={IconNames.ISSUE} className="rotate-180" />
          </div>
        </KeyValueTableRow>
      </KeyValueTable>

      <Button
        className="w-full !py-8 mt-64 max-w-sm"
        boxShadow={false}
        variant="secondary"
        type="submit"
        disabled={transactionStatus === 'pending' || isDisabled}
        data-testid="place-order"
        appendIconName="arrow-top-right"
      >
        {transactionStatus === 'pending' ? t('Pending...') : t('Submit')}
      </Button>
    </div>
  );
};
