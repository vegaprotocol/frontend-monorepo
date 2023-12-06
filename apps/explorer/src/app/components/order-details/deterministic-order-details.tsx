import { t } from '@vegaprotocol/i18n';
import { useExplorerDeterministicOrderQuery } from './__generated__/Order';
import { MarketLink } from '../links';
import PriceInMarket from '../price-in-market/price-in-market';
import { Time } from '../time';
import { sideText, statusText, tifFull, tifShort } from './lib/order-labels';
import SizeInMarket from '../size-in-market/size-in-market';
import { TxOrderPeggedReference } from '../txs/details/order/tx-order-peg';
import { OrderTypeMapping } from '@vegaprotocol/types';

export interface DeterministicOrderDetailsProps {
  id: string;
  // Version to fetch, with 0 being 'latest' and 1 being 'first'. Defaults to 0
  version?: number | null;
}

export const wrapperClasses =
  'grid lg:grid-cols-1 flex items-center max-w-xl border border-vega-light-200 dark:border-vega-dark-150 rounded-md pv-2 ph-5 mb-5';

/**
 * This component renders the *current* details for an order
 *
 * An important part of this component is that unlike most of the rest of the Explorer,
 * it is displaying 'live' data. With the current APIs it's impossible to get the state
 * of the order at a specific point in time. While one day that might be possible, this
 * order component is not built with that in mind.
 *
 * @param param0
 * @returns
 */
const DeterministicOrderDetails = ({
  id,
  version = null,
}: DeterministicOrderDetailsProps) => {
  const { data, error } = useExplorerDeterministicOrderQuery({
    variables: { orderId: id, version },
  });

  if (error || (data && !data.orderByID)) {
    return (
      <div className={wrapperClasses}>
        <div className="mb-12 lg:mb-0">
          <div className="relative block rounded-lg px-3 py-6 md:px-6 lg:-mr-7">
            <h2 className="text-3xl font-bold mb-4 display-5">
              {t('Order not found')}
            </h2>
            <p className="text-vega-light-400 mb-12">
              {t('No order created from this transaction')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.orderByID) {
    return null;
  }

  const o = data.orderByID;
  return (
    <div className={wrapperClasses}>
      <div className="mb-12 lg:mb-0">
        <div className="relative block px-3 py-6 md:px-6 lg:-mr-7">
          <h2 className="text-3xl font-bold mb-4 display-5">
            <abbr title={tifFull[o.timeInForce]} className="bb-dotted mr-2">
              {tifShort[o.timeInForce]}
            </abbr>
            {sideText[o.side]}
            <span className="mx-5 text-base">@</span>
            <PriceInMarket price={o.price} marketId={o.market.id} />
          </h2>
          <p className="text-gray-400 dark:text-gray-600">
            In <MarketLink id={o.market.id} /> at <Time date={o.createdAt} />.
          </p>
          {o.peggedOrder ? (
            <p className="text-gray-200">
              {t('Price peg')}:{' '}
              <TxOrderPeggedReference
                side={o.side}
                reference={o.peggedOrder.reference}
                offset={o.peggedOrder.offset}
                marketId={o.market.id}
              />
            </p>
          ) : null}
          {o.reference ? (
            <p className="text-gray-500 mt-4">
              <span>{t('Reference')}</span>: {o.reference}
            </p>
          ) : null}
          <div className="grid md:grid-cols-5 gap-x-6 mt-4">
            <div className="mb-12 md:mb-0">
              <h2 className="text-2xl font-bold text-dark mb-4">
                {t('Status')}
              </h2>
              <h5 className="text-lg font-medium text-gray-500 mb-0 capitalize">
                {statusText[o.status]}
              </h5>
            </div>

            <div className="mb-12 md:mb-0">
              <h2 className="text-2xl font-bold text-dark mb-4">{t('Size')}</h2>
              <h5 className="text-lg font-medium text-gray-500 mb-0">
                <SizeInMarket size={o.size} marketId={o.market.id} />
              </h5>
            </div>

            <div className="">
              <h2 className="text-2xl font-bold text-dark mb-4">
                {t('Version')}
              </h2>
              <h5 className="text-lg font-medium text-gray-500 mb-0">
                {o.version}
              </h5>
            </div>
            {o.type ? (
              <div className="">
                <h2 className="text-2xl font-bold text-dark mb-4">
                  {t('Type')}
                </h2>
                <h5 className="text-lg font-medium text-gray-500 mb-0">
                  {OrderTypeMapping[o.type]}
                </h5>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeterministicOrderDetails;
