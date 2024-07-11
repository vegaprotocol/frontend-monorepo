import { useT } from '../../lib/use-t';
import { SwapContainer } from '../swap';
import { WithdrawContainer } from '../withdraw-container';
import {
  AccountsContainer,
  type AccountsContainerProps,
} from '../accounts-container/accounts-container';
import React from 'react';
import { DepositContainer } from '../deposit-container';
import { TransferContainer } from '@vegaprotocol/accounts';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { create } from 'zustand';

export enum SidebarAccountsViewType {
  Deposit = 'Deposit',
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
}: Pick<AccountsContainerProps, 'pinnedAssets'>) => {
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
          orderByBalance
          hideZeroBalance
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
