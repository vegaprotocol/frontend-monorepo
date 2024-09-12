import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useFundsAvailableQuery } from './__generated__/FundsAvailable';
import compact from 'lodash/compact';
import BigNumber from 'bignumber.js';
import { toQUSD } from '@vegaprotocol/utils';

/**
 * Gets the funds for given public key and required min for
 * the referral program.
 *
 * (Uses currently connected public key if left empty)
 */
export const useFundsAvailable = (pubKey?: string, noPolling = false) => {
  const { pubKey: currentPubKey } = useVegaWallet();
  const partyId = pubKey || currentPubKey;
  const { data, loading, stopPolling } = useFundsAvailableQuery({
    variables: { partyId: partyId || '' },
    skip: !partyId,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
    pollInterval: noPolling ? 0 : 5000,
  });

  const fundsAvailable = data
    ? compact(data.party?.accountsConnection?.edges?.map((e) => e?.node))
    : undefined;
  const requiredFunds = data
    ? BigNumber(data.networkParameter?.value || '0')
    : undefined;

  const sumOfFunds =
    fundsAvailable
      ?.filter((fa) => fa.balance)
      .reduce(
        (sum, fa) => sum.plus(toQUSD(fa.balance, fa.asset.quantum)), // qUSD
        BigNumber(0)
      ) || BigNumber(0);

  if (requiredFunds && sumOfFunds.isGreaterThanOrEqualTo(requiredFunds)) {
    stopPolling();
  }

  return {
    loading,
    fundsAvailable,
    sumOfFunds,
    requiredFunds,
    isEligible:
      fundsAvailable != null &&
      requiredFunds != null &&
      sumOfFunds.isGreaterThanOrEqualTo(requiredFunds),
  };
};
