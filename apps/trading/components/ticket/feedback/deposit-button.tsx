import {
  ViewType,
  SidebarAccountsViewType,
  useSidebar,
  useSidebarAccountsInnerView,
} from '../../../lib/hooks/use-sidebar';

import { useT } from '../../../lib/use-t';

export const DepositButton = ({
  asset,
}: {
  asset: { id: string; symbol: string };
}) => {
  const t = useT();
  const setSidebar = useSidebar((store) => store.setView);
  const setSidebarView = useSidebarAccountsInnerView((store) => store.setView);
  return (
    <button
      onClick={() => {
        setSidebar(ViewType.Assets);
        setSidebarView([SidebarAccountsViewType.Deposit, asset.id]);
      }}
      type="button"
      className="underline underline-offset-4"
      data-testid="feedback-deposit-button"
    >
      {t('Deposit {{assetSymbol}}', { assetSymbol: asset.symbol })}
    </button>
  );
};
