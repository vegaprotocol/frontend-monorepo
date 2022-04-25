import { useContracts } from '../../contexts/contracts/contracts-context';
import { useTransaction } from '../../hooks/use-transaction';
import type { IClaimTokenParams } from '@vegaprotocol/smart-contracts-sdk';

export const useClaim = (claimData: IClaimTokenParams, address: string) => {
  const claimArgs = {
    ...claimData,
    ...claimData.signature,
    ...claimData.claim,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    country: claimData.country!,
    account: address,
  };
  const { claim } = useContracts();
  return useTransaction(() => claim.claim(claimArgs));
};
