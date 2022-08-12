import { addDecimal, formatNumber, t } from '@vegaprotocol/react-helpers';
import {
  Button,
  Icon,
  KeyValueTable,
  KeyValueTableRow,
  Tooltip,
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
            <Tooltip
              align="center"
              description={t(
                'When opening a position on a futures market, you must post margin to cover any potential losses that you may incur. The margin is typically a fraction of the notional position size. For example, for a notional position size of $500, if the margin requirement is 10%, then the estimated margin would be approximately $50.'
              )}
            >
              <div className="cursor-help">
                <Icon name={IconNames.ISSUE} className="block rotate-180" />
              </div>
            </Tooltip>
          </div>
        </KeyValueTableRow>
        <KeyValueTableRow noBorder>
          <>
            {t('No. of contracts')}{' '}
            <div className="text-ui-small inline">
              ({market.tradableInstrument.instrument.product.quoteName})
            </div>
          </>
          <div className="text-black dark:text-white flex gap-x-5 items-center">
            {formatNumber(order.size, market.decimalPlaces)}
            <Tooltip
              align="center"
              description={t(
                'The number of contracts determines how many units of the futures contract to buy or sell. For example, this is similar to buying one share of a listed company. The value of 1 contract is equivalent to the price of the contract. For example, if the current price is $50, then one contract is worth $50.'
              )}
            >
              <div className="cursor-help">
                <Icon name={IconNames.ISSUE} className="rotate-180" />
              </div>
            </Tooltip>
          </div>
        </KeyValueTableRow>
        <KeyValueTableRow noBorder>
          <>{t('Est. close out')}</>
          <div className="text-black dark:text-white flex gap-x-5 items-center">
            {estCloseOut}
            <Tooltip
              align="center"
              description={t(
                'Because you only need to post a fraction of your position size as margin when trading futures, it is possible to obtain leverage meaning your notional position size exceeds your account balance. In this scenario, if the market moves against your position, it will sometimes be necessary to force close your position due to insufficient funds. The estimated close out tells you the price at which that would happen based on current position and account balance.'
              )}
            >
              <div className="cursor-help">
                <Icon name={IconNames.ISSUE} className="rotate-180" />
              </div>
            </Tooltip>
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
