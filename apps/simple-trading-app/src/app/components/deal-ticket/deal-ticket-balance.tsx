import * as React from 'react';
import classNames from 'classNames';
import type { DealTicketQuery_market_tradableInstrument_instrument_product_settlementAsset } from '@vegaprotocol/deal-ticket';
import type { PartyBalanceQuery_party_accounts } from './__generated__/PartyBalanceQuery';
import { useSettlementAccount } from '../../hooks/use-settlement-account';
import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';

interface DealTicketBalanceProps {
  settlementAsset: DealTicketQuery_market_tradableInstrument_instrument_product_settlementAsset;
  accounts: PartyBalanceQuery_party_accounts[];
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
  const settlementAccount = useSettlementAccount(settlementAssetId, accounts);
  const formatedNumber =
    settlementAccount?.balance &&
    settlementAccount.asset.decimals &&
    addDecimalsFormatNumber(
      settlementAccount.balance,
      settlementAccount.asset.decimals
    );

  const balance = (
    <p className="text-blue text-lg font-semibold">
      {settlementAccount
        ? t(`${formatedNumber}`)
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
