import {
  BottomDrawer,
  BottomDrawerContent,
  Intent,
  TradingButton,
  TradingDropdown,
  TradingDropdownContent,
  TradingDropdownItem,
  TradingDropdownTrigger,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { MarketInfoAccordionContainer } from '@vegaprotocol/markets';
import { DepositContainer } from '@vegaprotocol/deposits';
import { TransferContainer } from '@vegaprotocol/accounts';
import { WithdrawContainer } from '../../components/withdraw-container';
import { useT } from '../../lib/use-t';
import { useVegaWallet, useDialogStore } from '@vegaprotocol/wallet-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Links } from '../../lib/links';
import { useState } from 'react';

enum DrawerView {
  Trade = 'Trade',
  Info = 'Info',
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Transfer = 'Transfer',
  Closed = 'Closed',
}

export const MarketActionDrawer = () => {
  const t = useT();
  const { pubKeys, isReadOnly } = useVegaWallet();
  const openVegaWalletDialog = useDialogStore((store) => store.open);
  const [drawer, setDrawer] = useState<DrawerView>(DrawerView.Closed);

  return (
    <>
      <div className="flex items-center gap-2 py-1 px-2">
        {!pubKeys.length || isReadOnly ? (
          <>
            <div className="flex-1">
              <TradingButton
                intent={Intent.Primary}
                size="medium"
                onClick={() => {
                  openVegaWalletDialog();
                }}
                fill={true}
              >
                {t('Connect')}
              </TradingButton>
            </div>
            <div className="flex-1">
              <TradingButton
                onClick={() => setDrawer(DrawerView.Trade)}
                fill={true}
              >
                {t('Trade')}
              </TradingButton>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1">
              <TradingButton
                onClick={() => setDrawer(DrawerView.Trade)}
                fill={true}
              >
                {t('Trade')}
              </TradingButton>
            </div>
            <div className="flex-1">
              <TradingButton
                onClick={() => setDrawer(DrawerView.Deposit)}
                role="link"
                fill={true}
              >
                {t('Deposit')}
              </TradingButton>
            </div>
          </>
        )}
        <div className="flex-1">
          <TradingDropdown
            trigger={
              <TradingDropdownTrigger>
                <TradingButton fill={true}>...</TradingButton>
              </TradingDropdownTrigger>
            }
          >
            <TradingDropdownContent>
              <TradingDropdownItem
                role="link"
                onClick={() => setDrawer(DrawerView.Deposit)}
              >
                <VegaIcon name={VegaIconNames.DEPOSIT} /> {t('Deposit')}
              </TradingDropdownItem>
              <TradingDropdownItem
                role="link"
                onClick={() => setDrawer(DrawerView.Withdraw)}
              >
                <VegaIcon name={VegaIconNames.WITHDRAW} /> {t('Withdraw')}
              </TradingDropdownItem>
              <TradingDropdownItem
                role="link"
                onClick={() => setDrawer(DrawerView.Transfer)}
              >
                <VegaIcon name={VegaIconNames.TRANSFER} /> {t('Transfer')}
              </TradingDropdownItem>
              <TradingDropdownItem onClick={() => setDrawer(DrawerView.Info)}>
                <VegaIcon name={VegaIconNames.BREAKDOWN} />{' '}
                {t('Market specification')}
              </TradingDropdownItem>
            </TradingDropdownContent>
          </TradingDropdown>
        </div>
      </div>
      <TradeDrawer drawer={drawer} setDrawer={setDrawer} />
    </>
  );
};

const TradeDrawer = ({
  drawer,
  setDrawer,
}: {
  drawer: DrawerView;
  setDrawer: (view: DrawerView) => void;
}) => {
  const params = useParams();
  const navigate = useNavigate();

  const renderContent = () => {
    if (drawer === DrawerView.Trade) {
      if (params.marketId) {
        return (
          <DealTicketContainer
            marketId={params.marketId}
            onDeposit={() => navigate(Links.DEPOSIT())}
          />
        );
      }
    }

    if (drawer === DrawerView.Info) {
      if (params.marketId) {
        return <MarketInfoAccordionContainer marketId={params.marketId} />;
      }
    }

    if (drawer === DrawerView.Deposit) {
      return <DepositContainer />;
    }

    if (drawer === DrawerView.Withdraw) {
      return <WithdrawContainer />;
    }

    if (drawer === DrawerView.Transfer) {
      return <TransferContainer />;
    }

    return null;
  };

  return (
    <BottomDrawer
      open={drawer !== DrawerView.Closed}
      onClose={() => setDrawer(DrawerView.Closed)}
    >
      <BottomDrawerContent>
        <div className="p-4 min-h-[742px]">{renderContent()}</div>
      </BottomDrawerContent>
    </BottomDrawer>
  );
};
