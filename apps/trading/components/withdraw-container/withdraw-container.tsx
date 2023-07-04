import { useVegaWallet } from '@vegaprotocol/wallet';
import { WithdrawFormContainer } from '@vegaprotocol/withdraws';
import { useVegaTransactionStore } from '@vegaprotocol/wallet';

export const WithdrawContainer = ({ assetId }: { assetId?: string }) => {
  const { pubKey } = useVegaWallet();
  const createTransaction = useVegaTransactionStore((state) => state.create);
  return (
    <WithdrawFormContainer
      assetId={assetId}
      partyId={pubKey ? pubKey : undefined}
      submit={({ amount, asset, receiverAddress }) => {
        createTransaction({
          withdrawSubmission: {
            amount,
            asset,
            ext: {
              erc20: {
                receiverAddress,
              },
            },
          },
        });
      }}
    />
  );
};
