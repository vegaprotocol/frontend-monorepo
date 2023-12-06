import { useVegaWallet } from '@vegaprotocol/wallet';
import { useFundsAvailableQuery } from './__generated__/FundsAvailable';
import compact from 'lodash/compact';
import sum from 'lodash/sum';

/**
 * Gets the funds for given public key and required min for
 * the referral program.
 *
 * (Uses currently connected public key if left empty)
 */
export const useFundsAvailable = (pubKey?: string) => {
  const { pubKey: currentPubKey } = useVegaWallet();
  const partyId = pubKey || currentPubKey;
  const { data, stopPolling } = useFundsAvailableQuery({
    variables: { partyId: partyId || '' },
    skip: !partyId,
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
    pollInterval: 5000,
  });

  const fundsAvailable = data
    ? compact(data.party?.accountsConnection?.edges?.map((e) => e?.node))
    : undefined;
  const requiredFunds = data
    ? BigInt(data.networkParameter?.value || '0')
    : undefined;

  const sumOfFunds = sum(
    fundsAvailable?.filter((fa) => fa.balance).map((fa) => BigInt(fa.balance))
  );

  if (requiredFunds && sumOfFunds >= requiredFunds) {
    stopPolling();
  }

  return {
    fundsAvailable,
    requiredFunds,
    isEligible:
      fundsAvailable != null &&
      requiredFunds != null &&
      sumOfFunds >= requiredFunds,
  };
};
