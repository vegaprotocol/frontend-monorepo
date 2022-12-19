import classNames from 'classnames';
import {
  addDecimalsFormatNumber,
  t,
  toBigNum,
} from '@vegaprotocol/react-helpers';
import type { MarketDealTicket } from '@vegaprotocol/market-list';
import { useAccountBalance } from '@vegaprotocol/accounts';

interface DealTicketBalanceProps {
  settlementAsset: MarketDealTicket['tradableInstrument']['instrument']['product']['settlementAsset'];
  isWalletConnected: boolean;
  className?: string;
}

export const DealTicketBalance = ({
  settlementAsset,
  isWalletConnected,
  className = '',
}: DealTicketBalanceProps) => {
  const settlementAssetId = settlementAsset?.id;
  const settlementAssetSymbol = settlementAsset?.symbol;

  const { accountBalance, accountDecimals } =
    useAccountBalance(settlementAssetId) || {};
  const settlementBalance = toBigNum(accountBalance || 0, accountDecimals || 0);

  const formattedNumber =
    accountBalance &&
    accountDecimals &&
    addDecimalsFormatNumber(accountBalance, accountDecimals);

  const balance = (
    <p className="text-blue text-lg font-semibold">
      {!settlementBalance.isZero()
        ? t(`${formattedNumber}`)
        : `No ${settlementAssetSymbol} left to trade`}
    </p>
  );

  const connectWallet = (
    <p>{t('Please connect your Vega wallet to see your balance')}</p>
  );

  const ariaLabel = t(`${settlementAssetSymbol} Balance`);

  return (
    <aside
      aria-label={ariaLabel}
      className={classNames('text-right', className)}
    >
      <div className="inline-block">
        <span className="text-blue">{settlementAssetSymbol}</span>
        {isWalletConnected ? balance : connectWallet}
      </div>
    </aside>
  );
};
