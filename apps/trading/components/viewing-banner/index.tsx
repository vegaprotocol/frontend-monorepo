import { ViewingAsBanner } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';

export const ViewingBanner = () => {
  const { isReadOnly, pubKey, disconnect } = useVegaWallet();
  return isReadOnly ? (
    <ViewingAsBanner pubKey={pubKey} disconnect={disconnect} />
  ) : null;
};
