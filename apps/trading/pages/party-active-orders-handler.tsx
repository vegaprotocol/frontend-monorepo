import { useDataProvider } from '@vegaprotocol/data-provider';
import { activeOrdersProvider } from '@vegaprotocol/orders';
import { useVegaWallet } from '@vegaprotocol/wallet';

export const PartyActiveOrdersHandler = () => {
  const { pubKey } = useVegaWallet();
  const variables = { partyId: pubKey || '' };
  const skip = !pubKey;
  useDataProvider({
    dataProvider: activeOrdersProvider,
    variables,
    skip,
  });
  return null;
};
