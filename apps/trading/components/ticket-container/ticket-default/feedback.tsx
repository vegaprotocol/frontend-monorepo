import { MarginMode } from '@vegaprotocol/types';
import { useTicketContext } from '../ticket-context';
import { useT } from '../../../lib/use-t';
import { useEstimatePosition } from '../use-estimate-position';
import { toBigNum } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

export const Feedback = () => {
  const { pubKey } = useVegaWallet();
  const ticket = useTicketContext('default');

  const { data } = useEstimatePosition();

  if (!pubKey) return null;

  const requiredCollateral = toBigNum(
    data?.estimatePosition?.collateralIncreaseEstimate.bestCase || '0',
    ticket.settlementAsset.decimals
  );

  const generalAccount = toBigNum(
    ticket.accounts.general,
    ticket.settlementAsset.decimals
  );
  const marginAccount = toBigNum(
    ticket.accounts.margin,
    ticket.settlementAsset.decimals
  );
  const orderMarginAccount = toBigNum(
    ticket.accounts.orderMargin,
    ticket.settlementAsset.decimals
  );

  if (ticket.marginMode.mode === MarginMode.MARGIN_MODE_CROSS_MARGIN) {
    if (
      generalAccount.isLessThanOrEqualTo(0) &&
      marginAccount.isLessThanOrEqualTo(0)
    ) {
      return <NoCollateral />;
    }
  } else if (
    ticket.marginMode.mode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN
  ) {
    if (
      generalAccount.isLessThanOrEqualTo(0) &&
      orderMarginAccount.isLessThanOrEqualTo(0)
    ) {
      return <NoCollateral />;
    }
  }

  if (generalAccount.isLessThan(requiredCollateral)) {
    return <NotEnoughCollateral />;
  }
};

const NoCollateral = () => {
  const t = useT();
  return <p>{t('No collateral')}</p>;
};

const NotEnoughCollateral = () => {
  const t = useT();
  return <p>{t('Not enough collateral')}</p>;
};
