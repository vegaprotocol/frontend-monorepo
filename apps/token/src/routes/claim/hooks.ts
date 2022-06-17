import { useContracts } from '../../contexts/contracts/contracts-context';
import { useTransaction } from '../../hooks/use-transaction';
import type { IClaimTokenParams } from '@vegaprotocol/smart-contracts';
import { removeDecimal } from '@vegaprotocol/react-helpers';
import { useAppState } from '../../contexts/app-state/app-state-context';

export const useClaim = (claimData: IClaimTokenParams, address: string) => {
  const {
    appState: { decimals },
  } = useAppState();

  const claimArgs = {
    ...claimData,
    ...claimData.signature,
    ...claimData.claim,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    country: claimData.country!,
    account: address,
    amount: removeDecimal(claimData.claim.amount.toString(), decimals),
  };
  const { claim } = useContracts();
  return useTransaction(() => claim.claim(claimArgs));
};
