import "./tranche-label.scss";

import { ADDRESSES, EthereumChainId, EthereumChainIds } from "../../config";

const TRANCHE_LABELS: Record<number, string[]> = {
  "5": ["Coinlist Option 1", "Community Whitelist"],
  "6": ["Coinlist Option 2"],
  "7": ["Coinlist Option 3"],
  "15": ["Coinlist Option 1", "Community Whitelist", "Coinlist wallets"],
  "16": ["Coinlist Option 2", "Coinlist wallets"],
};

/**
 * Some tranches have names that will be useful to
 * users trying to identify where their tokens are.
 * This component will render either nothing or a
 * name
 *
 * @param contract The contract address for the vesting contract
 * @param chainId The ID of the chain this contract is on
 * @param id The tranche ID on this contract
 */
export const TrancheLabel = ({
  contract,
  chainId,
  id,
}: {
  chainId: EthereumChainId | null;
  contract: string;
  id: number;
}) => {
  // Only mainnet tranches on the known vesting contract have useful name
  if (
    chainId &&
    chainId === EthereumChainIds.Mainnet &&
    contract === ADDRESSES.vestingAddress
  ) {
    // Only some tranches have titles worth showing
    if (TRANCHE_LABELS[id]) {
      return (
        <>
          {TRANCHE_LABELS[id].map((t, i) => (
            <strong className="tranche-label" key={`tranche-${id}-${i}`}>
              {t}
            </strong>
          ))}
        </>
      );
    }
  }

  return null;
};
