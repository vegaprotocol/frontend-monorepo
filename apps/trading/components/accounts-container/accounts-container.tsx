import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { Links } from '../../lib/links';
import {
  AccountManager,
  type AssetActions,
  TransferContainer,
} from '@vegaprotocol/accounts';
import { useState } from 'react';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useT } from '../../lib/use-t';
import { DepositContainer } from '@vegaprotocol/deposits';
import { SwapContainer } from '../swap';
import { WithdrawContainer } from '../withdraw-container';

type AccountsContainerProps = Partial<AssetActions> & {
  pinnedAssets?: string[];
  orderByBalance?: boolean;
  hideZeroBalance?: boolean;
};

export const AccountsContainer = ({
  pinnedAssets,
  orderByBalance,
  hideZeroBalance,
  onClickAsset,
  onClickDeposit,
  onClickSwap,
  onClickTransfer,
  onClickWithdraw,
}: AccountsContainerProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pubKey, isReadOnly } = useVegaWallet();
  const { open: openAssetDetailsDialog } = useAssetDetailsDialogStore();

  const navigateToAssetAction = (path: string, assetId: string | undefined) => {
    let params = '';
    if (assetId) {
      searchParams.append('assetId', assetId);
      params = `?${searchParams.toString()}`;
    }
    navigate(path + params);
  };

  const defaultActions: AssetActions = {
    onClickAsset: (assetId?: string) => {
      assetId && openAssetDetailsDialog(assetId);
    },
    onClickDeposit: (assetId) => {
      navigateToAssetAction(Links.DEPOSIT(), assetId);
    },
    onClickSwap: (assetId) => {
      navigateToAssetAction(Links.SWAP(), assetId);
    },
    onClickTransfer: (assetId) => {
      navigateToAssetAction(Links.TRANSFER(), assetId);
    },
    onClickWithdraw: (assetId) => {
      navigateToAssetAction(Links.WITHDRAW(), assetId);
    },
  };

  return (
    <AccountManager
      partyId={pubKey}
      onClickAsset={onClickAsset || defaultActions.onClickAsset}
      onClickWithdraw={onClickWithdraw || defaultActions.onClickWithdraw}
      onClickDeposit={onClickDeposit || defaultActions.onClickDeposit}
      onClickTransfer={onClickTransfer || defaultActions.onClickTransfer}
      onClickSwap={onClickSwap || defaultActions.onClickSwap}
      isReadOnly={isReadOnly}
      pinnedAssets={pinnedAssets}
      orderByBalance={orderByBalance}
      hideZeroBalance={hideZeroBalance}
    />
  );
};

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
    const [view, assetId] = innerView;

    let innerContainer = undefined;
    switch (view) {
      case View.Deposit:
        innerContainer = <DepositContainer assetId={assetId} />;
        break;
      case View.Swap:
        innerContainer = (
          <SwapContainer
            assetId={assetId}
            onDeposit={(assetId) => {
              if (!assetId) return;
              setInnerView([View.Deposit, assetId]);
            }}
          />
        );
        break;
      case View.Transfer:
        innerContainer = <TransferContainer assetId={assetId} />;
        break;
      case View.Withdraw:
        innerContainer = <WithdrawContainer assetId={assetId} />;
    }

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
        <div className="mt-2">{innerContainer}</div>
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
