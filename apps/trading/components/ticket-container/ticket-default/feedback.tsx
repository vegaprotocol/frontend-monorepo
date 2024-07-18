import { MarginMode } from '@vegaprotocol/types';
import { useTicketContext } from '../ticket-context';
import { useT } from '../../../lib/use-t';
import { useEstimatePosition } from '../use-estimate-position';
import { toBigNum } from '@vegaprotocol/utils';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import type BigNumber from 'bignumber.js';
import { Tooltip } from '@vegaprotocol/ui-toolkit';
import {
  SidebarAccountsViewType,
  useSidebarAccountsInnerView,
} from '../../accounts-container';
import { ViewType, useSidebar } from '../../sidebar';

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
      return <NoCollateral asset={ticket.settlementAsset} />;
    }
  } else if (
    ticket.marginMode.mode === MarginMode.MARGIN_MODE_ISOLATED_MARGIN
  ) {
    if (
      generalAccount.isLessThanOrEqualTo(0) &&
      orderMarginAccount.isLessThanOrEqualTo(0)
    ) {
      return <NoCollateral asset={ticket.settlementAsset} />;
    }
  }

  if (generalAccount.isLessThan(requiredCollateral)) {
    return (
      <NotEnoughCollateral
        requiredCollateral={requiredCollateral}
        availableCollateral={generalAccount}
        asset={ticket.settlementAsset}
      />
    );
  }
};

const textClasses = 'text-xs text-warning';

const NoCollateral = ({ asset }: { asset: AssetFieldsFragment }) => {
  const t = useT();
  return (
    <p data-testid="feedback-no-collateral" className={textClasses}>
      {t('You need tDAI in your wallet to trade in this market')}{' '}
      <DepositButton asset={asset} />
    </p>
  );
};

const NotEnoughCollateral = ({
  asset,
  availableCollateral,
  requiredCollateral,
}: {
  asset: AssetFieldsFragment;
  availableCollateral: BigNumber;
  requiredCollateral: BigNumber;
}) => {
  const t = useT();

  const description = (
    <div className="flex flex-col gap-1 p-2 text-xs">
      <p>
        {t('{{amount}} {{assetSymbol}} is currently required.', {
          amount: requiredCollateral.toString(),
          assetSymbol: asset.symbol,
        })}
      </p>
      <p>
        {t('You have only {{amount}}.', {
          amount: availableCollateral.toString(),
        })}
      </p>
    </div>
  );

  return (
    <p className={textClasses}>
      <Tooltip description={description}>
        <span data-testid="feedback-not-enough-collateral">
          {t('You may not have enough margin available to open this position.')}
        </span>
      </Tooltip>{' '}
      <DepositButton asset={asset} />
    </p>
  );
};

const DepositButton = ({
  asset,
}: {
  asset: { id: string; symbol: string };
}) => {
  const t = useT();
  const setSidebar = useSidebar((store) => store.setView);
  const setSidebarView = useSidebarAccountsInnerView((store) => store.setView);
  return (
    <button
      onClick={() => {
        setSidebar(ViewType.Assets);
        setSidebarView([SidebarAccountsViewType.Deposit, asset.id]);
      }}
      type="button"
      className="underline underline-offset-4"
      data-testid="feedback-deposit-button"
    >
      {t('Deposit {{assetSymbol}}', { assetSymbol: asset.symbol })}
    </button>
  );
};
