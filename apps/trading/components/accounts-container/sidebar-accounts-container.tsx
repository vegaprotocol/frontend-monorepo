import { useState } from 'react';
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

enum View {
  Deposit = 'Deposit',
  Swap = 'Swap',
  Transfer = 'Transfer',
  Withdraw = 'Withdraw',
}

type InnerView = [view: View, assetId: string];

export const SidebarAccountsContainer = ({
  pinnedAssets,
}: Pick<AccountsContainerProps, 'pinnedAssets'>) => {
  const t = useT();
  const [innerView, setInnerView] = useState<InnerView | undefined>(undefined);

  if (innerView) {
    const [view] = innerView;
    return (
      <div className="p-2">
        <header className="text-lg">
          <button
            className="flex gap-1 items-center"
            onClick={() => {
              setInnerView(undefined);
            }}
          >
            <span className="text-muted inline-flex items-center">
              <VegaIcon name={VegaIconNames.CHEVRON_LEFT} />
            </span>
            <span>{t(view)}</span>
          </button>
        </header>
        <div className="mt-2">
          <InnerContainer innerView={innerView} setInnerView={setInnerView} />
        </div>
      </div>
    );
  }

  return (
    <AccountsContainer
      pinnedAssets={pinnedAssets}
      orderByBalance
      hideZeroBalance
      onClickDeposit={(assetId) => {
        setInnerView([View.Deposit, assetId]);
      }}
      onClickSwap={(assetId) => {
        setInnerView([View.Swap, assetId]);
      }}
      onClickTransfer={(assetId) => {
        setInnerView([View.Transfer, assetId]);
      }}
      onClickWithdraw={(assetId) => {
        setInnerView([View.Withdraw, assetId]);
      }}
    />
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
    case View.Deposit:
      return <DepositContainer initialAssetId={assetId} />;

    case View.Swap:
      return (
        <SwapContainer
          assetId={assetId}
          onDeposit={(assetId) => {
            if (!assetId) return;
            setInnerView?.([View.Deposit, assetId]);
          }}
        />
      );

    case View.Transfer:
      return <TransferContainer assetId={assetId} />;

    case View.Withdraw:
      return <WithdrawContainer initialAssetId={assetId} />;
  }
};
