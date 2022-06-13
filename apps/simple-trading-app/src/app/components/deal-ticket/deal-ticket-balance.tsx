import * as React from 'react';
import type { DealTicketQuery_market_tradableInstrument_instrument_product_settlementAsset } from '@vegaprotocol/deal-ticket';
import type { PartyBalanceQuery_party_accounts } from './__generated__/PartyBalanceQuery';
import { useSettlementAccount } from '../../hooks/use-settlement-account';
import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';

interface DealTicketBalanceProps {
  settlementAsset: DealTicketQuery_market_tradableInstrument_instrument_product_settlementAsset;
  accounts: PartyBalanceQuery_party_accounts[];
  isWalletConnected: boolean;
}

export const DealTicketBalance = ({
  settlementAsset,
  accounts,
  isWalletConnected,
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

  const balance = settlementAccount ? (
    <p>
      {t(
        `${formatedNumber} ${settlementAccount.asset.symbol} available to trade`
      )}
    </p>
  ) : (
    <p>{t(`You have no ${settlementAssetSymbol} available to trade`)}</p>
  );

  const connectWallet = (
    <p>
      {t(
        "Please connect your Vega wallet to see your balance for this market's settlement asset"
      )}
    </p>
  );

  return (
    <div className="text-right">
      <div className="border border-current p-16 inline-block">
        <small className="text-text">{t('Balance')}</small>
        {isWalletConnected ? balance : connectWallet}
      </div>
    </div>
  );
};
