import classNames from 'classnames';
import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';
import type {
  AccountFragment,
  DealTicketMarketFragment,
} from '@vegaprotocol/deal-ticket';
import { useSettlementAccount } from '@vegaprotocol/deal-ticket';

interface DealTicketBalanceProps {
  settlementAsset: DealTicketMarketFragment['tradableInstrument']['instrument']['product']['settlementAsset'];
  accounts: AccountFragment[];
  isWalletConnected: boolean;
  className?: string;
}

export const DealTicketBalance = ({
  settlementAsset,
  accounts,
  isWalletConnected,
  className = '',
}: DealTicketBalanceProps) => {
  const settlementAssetId = settlementAsset?.id;
  const settlementAssetSymbol = settlementAsset?.symbol;
  const settlementAccount = useSettlementAccount(
    settlementAssetId,
    accounts,
    AccountType.ACCOUNT_TYPE_GENERAL
  );
  const formattedNumber =
    settlementAccount?.balance &&
    settlementAccount.asset.decimals &&
    addDecimalsFormatNumber(
      settlementAccount.balance,
      settlementAccount.asset.decimals
    );

  const balance = (
    <p className="text-blue text-lg font-semibold">
      {settlementAccount
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
