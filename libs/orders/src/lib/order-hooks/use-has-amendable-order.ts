import { hasAmendableOrderProvider } from '../components/order-data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useDataProvider } from '@vegaprotocol/data-provider';

export const useHasAmendableOrder = ({ marketId }: { marketId?: string }) => {
  const { pubKey } = useVegaWallet();
  const { data: hasAmendableOrder } = useDataProvider({
    dataProvider: hasAmendableOrderProvider,
    variables: {
      partyId: pubKey || '',
      marketId,
    },
    skip: !pubKey,
  });
  return Boolean(hasAmendableOrder);
};
