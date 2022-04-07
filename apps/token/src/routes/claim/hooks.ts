import { IClaimTokenParams } from "@vegaprotocol/smart-contracts-sdk";

import { useContracts } from "../../contexts/contracts/contracts-context";
import { useTransaction } from "../../hooks/use-transaction";

export const useClaim = (claimData: IClaimTokenParams, address: string) => {
  const claimArgs = {
    ...claimData,
    ...claimData.signature,
    ...claimData.claim,
    country: claimData.country!,
    account: address,
  };
  const { claim } = useContracts();
  return useTransaction(() => claim.claim(claimArgs));
};
