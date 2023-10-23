import { useCallback, useState } from 'react';
import { hasAmendableOrderProvider } from '../components/order-data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useDataProvider } from '@vegaprotocol/data-provider';

export const useHasAmendableOrder = () => {
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
    },
    skip: !pubKey,
  });

  return hasAmendableOrder;
};
