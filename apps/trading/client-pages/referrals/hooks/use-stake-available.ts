import { useVegaWallet } from '@vegaprotocol/wallet';
import { useStakeAvailableQuery } from './__generated__/StakeAvailable';

/**
 * Gets the current stake available for given public key and required stake for
 * the referral program.
 *
 * (Uses currently connected public key if left empty)
 */
export const useStakeAvailable = (pubKey?: string) => {
  const { pubKey: currentPubKey } = useVegaWallet();
  const partyId = pubKey || currentPubKey;
  const { data } = useStakeAvailableQuery({
    variables: { partyId: partyId || '' },
    skip: !partyId,
    // TODO: remove when network params available
    errorPolicy: 'ignore',
  });

  const stakeAvailable = data
    ? BigInt(data.party?.stakingSummary.currentStakeAvailable || '0')
    : undefined;
  // const requiredStake = data
  //   ? BigInt(data.networkParameter?.value || '0')
  //   : undefined;
  const requiredStake = BigInt(10);

  return {
    stakeAvailable,
    requiredStake,
    isEligible:
      stakeAvailable != null &&
      requiredStake != null &&
      stakeAvailable >= requiredStake,
  };
};
