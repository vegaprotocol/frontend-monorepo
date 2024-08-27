import { useT } from '../../lib/use-t';
import { SwapContainer } from '../swap';
import { WithdrawContainer } from '../withdraw-container';
import {
  AccountsContainer,
  type AccountsContainerProps,
} from '../accounts-container/accounts-container';
import { DepositContainer } from '../deposit-container';
import { TransferContainer } from '@vegaprotocol/accounts';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import {
  type InnerView,
  useSidebarAccountsInnerView,
  SidebarAccountsViewType,
} from '../../lib/hooks/use-sidebar';

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
          <header className="text-base">
            <button
              className="flex gap-1 items-center"
              onClick={() => {
                setInnerView(undefined);
              }}
            >
              <span className="text-surface-1-fg-muted inline-flex items-center">
                <VegaIcon name={VegaIconNames.CHEVRON_LEFT} size={14} />
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
  const [view, assetId] = innerView;
  switch (view) {
    case SidebarAccountsViewType.Deposit:
      return <DepositContainer initialAssetId={assetId} />;

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
