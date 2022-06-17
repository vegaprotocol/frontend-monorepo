import type { Token } from '@vegaprotocol/smart-contracts';
import { useEthereumConfig, useEthereumTransaction } from '@vegaprotocol/web3';

export const useSubmitApproval = (contract: Token | null) => {
  const { config } = useEthereumConfig();

  const transaction = useEthereumTransaction(() => {
    if (!contract || !config) {
      return null;
    }
    return contract.approve(
      config.collateral_bridge_contract.address,
      Number.MAX_SAFE_INTEGER.toString()
    );
  });

  return transaction;
};
