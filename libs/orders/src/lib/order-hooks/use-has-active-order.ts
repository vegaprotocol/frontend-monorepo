import { useCallback, useState } from 'react';
import { hasActiveOrderProvider } from '../components/order-data-provider/';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/react-helpers';

export const useHasActiveOrder = (marketId?: string) => {
  const { pubKey } = useVegaWallet();
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const update = useCallback(({ data }: { data: boolean | null }) => {
    console.log({ data });
    setHasActiveOrder(!!data);
    return true;
  }, []);
  useDataProvider({
    dataProvider: hasActiveOrderProvider,
    update,
    variables: {
      partyId: pubKey || '',
      marketId,
    },
    skip: !pubKey,
  });

  return hasActiveOrder;
};
