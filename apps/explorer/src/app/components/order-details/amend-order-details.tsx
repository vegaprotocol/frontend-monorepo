import { t } from '@vegaprotocol/i18n';
import { useExplorerDeterministicOrderQuery } from './__generated__/Order';
import { MarketLink } from '../links';
import PriceInMarket from '../price-in-market/price-in-market';
import { Time } from '../time';

import { sideText, peggedReference } from './lib/order-labels';
import type { components } from '../../../types/explorer';
import { VegaColours } from '@vegaprotocol/tailwindcss-config';
import { wrapperClasses } from './deterministic-order-details';

export interface AmendOrderDetailsProps {
  id: string;
  amend: components['schemas']['v1OrderAmendment'];
  // Version to fetch. Latest is provided by default
  version?: number;
}

export function getSideDeltaColour(delta: string): string {
  if (delta.charAt(0) === '-') {
    return VegaColours.pink.DEFAULT;
  } else {
    return VegaColours.green.DEFAULT;
  }
}

/**
 * This component renders the changes to an order made in an amend. It's very
 * similar to the deterministic-order-details component, and should probably
 * eventually be merged in to that view. However the APIs to make that experience
 * work nicely are not available, so instead of making 1 complex component, it's
 * currently 2 similar components.
 *
 * @param param0
 * @returns
 */
const AmendOrderDetails = ({ id, version, amend }: AmendOrderDetailsProps) => {
  const variables = version ? { orderId: id, version } : { orderId: id };

  const { data, error } = useExplorerDeterministicOrderQuery({
    variables,
  });

  if (error || (data && !data.orderByID)) {
    return (
      <div className={wrapperClasses}>
        <div className="mb-12 lg:mb-0">
          <div className="relative block rounded-lg px-3 py-6 md:px-6 lg:-mr-7">
            <h2 className="display-5 mb-4 text-3xl font-bold">
              {t('Order not found')}
            </h2>
            <p className="mb-12 text-gray-500">
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
          <h2 className="display-5 mb-4 text-3xl font-bold">
            {t('Edits to ')}
            {sideText[o.side]}
            {t(' order')}
          </h2>
          <div className="mb-4 text-gray-500">
            In <MarketLink id={o.market.id} />, updated at{' '}
            <Time date={o.updatedAt} />.
          </div>

          <div className="grid gap-x-6 md:grid-cols-4">
            {amend.sizeDelta && amend.sizeDelta !== '0' ? (
              <div className="mb-12 md:mb-0">
                <h2 className="text-dark mb-4 text-2xl font-bold">
                  {t('New size')}
                </h2>
                <h5
                  className={`mb-0 text-lg font-medium capitalize text-gray-500 ${getSideDeltaColour(
                    amend.sizeDelta
                  )}`}
                >
                  {amend.sizeDelta}
                </h5>
              </div>
            ) : null}

            {amend.price && amend.price !== '0' ? (
              <div className="">
                <h2 className="text-dark mb-4 text-2xl font-bold">
                  {t('New price')}
                </h2>
                <h5 className="mb-0 text-lg font-medium text-gray-500">
                  <PriceInMarket price={amend.price} marketId={o.market.id} />
                </h5>
              </div>
            ) : null}

            {amend.peggedReference &&
            amend.peggedReference !== 'PEGGED_REFERENCE_UNSPECIFIED' ? (
              <div className="">
                <h2 className="text-dark mb-4 text-2xl font-bold">
                  {t('New reference')}
                </h2>
                <h5 className="mb-0 text-lg font-medium text-gray-500">
                  {peggedReference[amend.peggedReference]}
                </h5>
              </div>
            ) : null}

            {amend.peggedOffset ? (
              <div className="">
                <h2 className="text-dark mb-4 text-2xl font-bold">
                  {t('New offset')}
                </h2>
                <h5 className="mb-0 text-lg font-medium text-gray-500">
                  {amend.peggedOffset}
                </h5>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmendOrderDetails;
