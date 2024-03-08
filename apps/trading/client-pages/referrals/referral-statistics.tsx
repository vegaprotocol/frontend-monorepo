import { Loader } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { ApplyCodeFormContainer } from './apply-code-form';
import { useReferralProgram } from './hooks/use-referral-program';
import { useFindReferralSet } from './hooks/use-find-referral-set';
import { Referees } from './referees';
import { ReferrerStatistics } from './referrer-statistics';
import { RefereeStatistics } from './referee-statistics';
import { DEFAULT_AGGREGATION_DAYS } from './constants';

export const ReferralStatistics = () => {
  const { pubKey } = useVegaWallet();

  const program = useReferralProgram();

  const {
    data: referralSet,
    loading: referralSetLoading,
    role,
    refetch,
  } = useFindReferralSet(pubKey);

  if (referralSetLoading) {
    return <Loader size="small" />;
  }

  const aggregationEpochs =
    program.details?.windowLength || DEFAULT_AGGREGATION_DAYS;

  if (referralSet?.id && role === 'referrer') {
    return (
      <>
        <ReferrerStatistics
          aggregationEpochs={aggregationEpochs}
          createdAt={referralSet.createdAt}
          setId={referralSet.id}
        />
        <Referees
          setId={referralSet.id}
          aggregationEpochs={aggregationEpochs}
        />
      </>
    );
  }

  if (pubKey && referralSet?.id && role === 'referee') {
    return (
      <RefereeStatistics
        aggregationEpochs={aggregationEpochs}
        pubKey={pubKey}
        referrerPubKey={referralSet.referrer}
        setId={referralSet.id}
      />
    );
  }

  return <ApplyCodeFormContainer onSuccess={refetch} />;
};
