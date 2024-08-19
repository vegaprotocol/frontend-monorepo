import {
  BottomDrawer,
  BottomDrawerContent,
  Intent,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { TicketContainer } from '../../components/ticket';
import { MarketInfoAccordionContainer } from '@vegaprotocol/markets';
import { DepositContainer } from '../../components/deposit-container';
import { TransferContainer } from '@vegaprotocol/accounts';
import { WithdrawContainer } from '../../components/withdraw-container';
import { useT } from '../../lib/use-t';
import { useVegaWallet, useDialogStore } from '@vegaprotocol/wallet-react';
import { useParams } from 'react-router-dom';
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
              <Button
                intent={Intent.Primary}
                size="md"
                onClick={() => {
                  openVegaWalletDialog();
                }}
                fill={true}
              >
                {t('Connect')}
              </Button>
            </div>
            <div className="flex-1">
              <Button onClick={() => setDrawer(DrawerView.Trade)} fill={true}>
                {t('Trade')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1">
              <Button onClick={() => setDrawer(DrawerView.Trade)} fill={true}>
                {t('Trade')}
              </Button>
            </div>
            <div className="flex-1">
              <Button
                onClick={() => setDrawer(DrawerView.Deposit)}
                role="link"
                fill={true}
              >
                {t('Deposit')}
              </Button>
            </div>
          </>
        )}
        <div className="flex-1">
          <DropdownMenu
            trigger={
              <DropdownMenuTrigger>
                <Button fill={true}>...</Button>
              </DropdownMenuTrigger>
            }
          >
            <DropdownMenuContent>
              <DropdownMenuItem
                role="link"
                onClick={() => setDrawer(DrawerView.Deposit)}
              >
                <VegaIcon name={VegaIconNames.DEPOSIT} /> {t('Deposit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                role="link"
                onClick={() => setDrawer(DrawerView.Withdraw)}
              >
                <VegaIcon name={VegaIconNames.WITHDRAW} /> {t('Withdraw')}
              </DropdownMenuItem>
              <DropdownMenuItem
                role="link"
                onClick={() => setDrawer(DrawerView.Transfer)}
              >
                <VegaIcon name={VegaIconNames.TRANSFER} /> {t('Transfer')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDrawer(DrawerView.Info)}>
                <VegaIcon name={VegaIconNames.BREAKDOWN} />{' '}
                {t('Market specification')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

  const renderContent = () => {
    if (drawer === DrawerView.Trade) {
      if (params.marketId) {
        return <TicketContainer />;
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
