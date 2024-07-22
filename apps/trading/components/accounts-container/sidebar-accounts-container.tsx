import { useT } from '../../lib/use-t';
import { SwapContainer } from '../swap';
import { WithdrawContainer } from '../withdraw-container';
import {
  AccountsContainer,
  type AccountsContainerProps,
} from '../accounts-container/accounts-container';
import { DepositContainer } from '../deposit-container';
import { TransferContainer } from '@vegaprotocol/accounts';
import {
  VegaIcon,
  VegaIconNames,
  Notification,
  Intent,
} from '@vegaprotocol/ui-toolkit';
import { create } from 'zustand';
import { SquidContainer } from '../squid-container';

export enum SidebarAccountsViewType {
  Deposit = 'Deposit',
  CrossChainDeposit = 'Cross-chain deposit',
  Swap = 'Swap',
  Transfer = 'Transfer',
  Withdraw = 'Withdraw',
}

type InnerView = [view: SidebarAccountsViewType, assetId: string];

type SidebarAccountsInnerViewStore = {
  view: InnerView | undefined;
  setView: (view: InnerView | undefined) => void;
};
export const useSidebarAccountsInnerView =
  create<SidebarAccountsInnerViewStore>()((set) => ({
    view: undefined,
    setView: (view) => set({ view }),
  }));

export const SidebarAccountsContainer = ({
  pinnedAssets,
  orderByBalance = true,
  hideZeroBalance = true,
  searchTerm,
}: AccountsContainerProps) => {
  const t = useT();

  const [innerView, setInnerView] = useSidebarAccountsInnerView((state) => [
    state.view,
    state.setView,
  ]);

  return (
    <>
      {innerView && (
        <div className="p-2">
          <header className="text-lg">
            <button
              className="flex gap-1 items-center"
              onClick={() => {
                setInnerView(undefined);
              }}
            >
              <span className="text-muted inline-flex items-center">
                <VegaIcon name={VegaIconNames.CHEVRON_LEFT} size={20} />
              </span>
              <span>{t(innerView[0])}</span>
            </button>
          </header>
          <div className="mt-2">
            <InnerContainer innerView={innerView} setInnerView={setInnerView} />
          </div>
        </div>
      )}
      <div className={innerView ? 'hidden' : 'block'}>
        <AccountsContainer
          pinnedAssets={pinnedAssets}
          orderByBalance={orderByBalance}
          hideZeroBalance={hideZeroBalance}
          onClickDeposit={(assetId) => {
            setInnerView([SidebarAccountsViewType.Deposit, assetId]);
          }}
          onClickCrossChainDeposit={(assetId) => {
            setInnerView([SidebarAccountsViewType.CrossChainDeposit, assetId]);
          }}
          onClickSwap={(assetId) => {
            setInnerView([SidebarAccountsViewType.Swap, assetId]);
          }}
          onClickTransfer={(assetId) => {
            setInnerView([SidebarAccountsViewType.Transfer, assetId]);
          }}
          onClickWithdraw={(assetId) => {
            setInnerView([SidebarAccountsViewType.Withdraw, assetId]);
          }}
          searchTerm={searchTerm}
        />
      </div>
    </>
  );
};

const InnerContainer = ({
  innerView,
  setInnerView,
}: {
  innerView: InnerView;
  setInnerView?: (innerView: InnerView | undefined) => void;
}) => {
  const t = useT();
  const [view, assetId] = innerView;
  switch (view) {
    case SidebarAccountsViewType.Deposit:
      return <DepositContainer initialAssetId={assetId} />;

    case SidebarAccountsViewType.CrossChainDeposit:
      return (
        <div className="flex flex-col gap-1">
          <Notification
            intent={Intent.Info}
            message={t(
              'Use this form to utilise Squid Router to make cross-chain deposits from any supported chain onto Vega. The amount you receive will be deposited directly to the network. To ensure users enjoy the cheapest fees possible this mode only supports deposits into Arbitrum assets'
            )}
          />
          <SquidContainer />
        </div>
      );

    case SidebarAccountsViewType.Swap:
      return (
        <SwapContainer
          assetId={assetId}
          onDeposit={(assetId) => {
            if (!assetId) return;
            setInnerView?.([SidebarAccountsViewType.Deposit, assetId]);
          }}
        />
      );

    case SidebarAccountsViewType.Transfer:
      return <TransferContainer assetId={assetId} />;

    case SidebarAccountsViewType.Withdraw:
      return <WithdrawContainer initialAssetId={assetId} />;
  }
};
