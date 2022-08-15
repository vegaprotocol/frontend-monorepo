import { t } from '@vegaprotocol/react-helpers';
import {
  Button,
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
import { DealTicketEstimates } from './deal-ticket-estimates';

export const MARKET_TAGS_QUERY = gql`
  query MarketTags($marketId: ID!) {
    market(id: $marketId) {
      tradableInstrument {
        instrument {
          id
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
  quoteName: string;
  price: string;
  fees: string;
  notionalSize: string;
}

export default ({
  isDisabled,
  market,
  order,
  transactionStatus,
  estCloseOut,
  quoteName,
  fees,
  price,
  notionalSize,
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
            {`@ ${price} `}
            <span className="text-ui-small inline">(EST)</span>
          </div>
        </KeyValueTableRow>
      </KeyValueTable>

      <DealTicketEstimates
        size={order.size}
        quoteName={quoteName}
        fees={fees}
        estCloseOut={estCloseOut}
        notionalSize={notionalSize}
      />

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
