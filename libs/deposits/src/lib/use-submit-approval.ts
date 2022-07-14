import { removeDecimal } from '@vegaprotocol/react-helpers';
import type { Token } from '@vegaprotocol/smart-contracts';
import { useEthereumConfig, useEthereumTransaction } from '@vegaprotocol/web3';

export const useSubmitApproval = (
  contract: Token | null,
  decimals: number | undefined
) => {
  const { config } = useEthereumConfig();

  const transaction = useEthereumTransaction(() => {
    if (!contract || !config || decimals === undefined) {
      return null;
    }

    const amount = removeDecimal('1000000', decimals);

    return contract.approve(config.collateral_bridge_contract.address, amount);
  });

  return transaction;
};
