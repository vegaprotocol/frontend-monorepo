import { t } from '@vegaprotocol/react-helpers';
import {
  Button,
  KeyValueTable,
  KeyValueTableRow,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { DealTicketMarketFragment } from '@vegaprotocol/deal-ticket';
import { DealTicketEstimates } from '@vegaprotocol/deal-ticket';
import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import { SIDE_NAMES } from './side-selector';
import { gql, useQuery } from '@apollo/client';
import type {
  MarketTags,
  MarketTagsVariables,
} from './__generated__/MarketTags';
import { Schema } from '@vegaprotocol/types';
import { MarketExpires } from '@vegaprotocol/market-info';

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
  market: DealTicketMarketFragment;
  isDisabled: boolean;
  transactionStatus?: string;
  order: OrderSubmissionBody['orderSubmission'];
  estCloseOut: string;
  estMargin: string;
  quoteName: string;
  price: string;
  fees: string;
  notionalSize: string;
  slippage: number;
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
  slippage,
}: Props) => {
  const { data: tagsData } = useQuery<MarketTags, MarketTagsVariables>(
    MARKET_TAGS_QUERY,
    {
      variables: { marketId: market.id },
    }
  );

  return (
    <div className="mb-8 text-black dark:text-white" data-testid="review-trade">
      <KeyValueTable>
        <KeyValueTableRow noBorder>
          <div className="flex flex-none gap-x-2 items-center">
            <div
              className={classNames(
                {
                  'buyButton dark:buyButtonDark':
                    order.side === Schema.Side.SIDE_BUY,
                  'sellButton dark:sellButtonDark':
                    order.side === Schema.Side.SIDE_SELL,
                },
                'px-2 py-1 inline text-ui-small'
              )}
            >
              {SIDE_NAMES[order.side]}
            </div>
            <div>{market.tradableInstrument.instrument.product.quoteName}</div>
            <div>
              {tagsData?.market?.tradableInstrument.instrument.metadata
                .tags && (
                <MarketExpires
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
        slippage={slippage.toString()}
      />

      <div className="mt-12 max-w-sm">
        <Button
          fill={true}
          type="submit"
          disabled={transactionStatus === 'pending' || isDisabled}
          data-testid="place-order"
          rightIcon="arrow-top-right"
        >
          {transactionStatus === 'pending' ? t('Pending...') : t('Submit')}
        </Button>
      </div>
    </div>
  );
};
