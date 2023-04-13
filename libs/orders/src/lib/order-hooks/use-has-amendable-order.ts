import { useCallback, useState } from 'react';
import { hasAmendableOrderProvider } from '../components/order-data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/react-helpers';

export const useHasAmendableOrder = (marketId?: string) => {
  const { pubKey } = useVegaWallet();
  const [hasAmendableOrder, setHasAmendableOrder] = useState(false);
  const update = useCallback(({ data }: { data: boolean | null }) => {
    setHasAmendableOrder(Boolean(data));
    return true;
  }, []);
  useDataProvider({
    dataProvider: hasAmendableOrderProvider,
    update,
    variables: {
      partyId: pubKey || '',
      marketId,
    },
    skip: !pubKey,
  });

  return hasAmendableOrder;
};
