import { useTranslation } from 'react-i18next';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import {
  formatMinimumStakedTokens,
  formatReferralRewardMultiplier,
} from '../proposal-referral-program-details';
import { formatNumberPercentage } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';

// These types are not generated as it's not known how dynamic these are
type VestingBenefitTier = {
  minimum_quantum_balance: string;
  reward_multiplier: string;
};

type ActivityStreakBenefitTier = {
  minimum_activity_streak: number;
  reward_multiplier: string;
  vesting_multiplier: string;
};

export type BenefitTiers =
  | Array<ActivityStreakBenefitTier>
  | Array<VestingBenefitTier>;

export function getBenefitTiers(json: string): BenefitTiers {
  try {
    const parsed = JSON.parse(json);
    return parsed.tiers;
  } catch (e) {
    return [];
  }
}

export const formatVolumeDiscountFactor = (value: string) => {
  return formatNumberPercentage(new BigNumber(value).times(100));
};

interface ProposalReferralProgramDetailsProps {
  proposal: ProposalQuery['proposal'];
}

/**
 * Special rendered for network proposals that change any benefit tiers,
 * which is detected by:
 * 1) it being a network parameter change
 * 2) the name of the field ending in `.benefitTiers`
 *
 * It only renders known fields so that they can be formatted correctly.
 */
export const ProposalUpdateBenefitTiers = ({
  proposal,
}: ProposalReferralProgramDetailsProps) => {
  const { t } = useTranslation();
  if (
    proposal?.terms?.change?.__typename !== 'UpdateNetworkParameter' ||
    proposal?.terms?.change?.networkParameter.key.slice(-13) !== '.benefitTiers'
  ) {
    return null;
  }

  const benefitTiersString = proposal?.terms?.change?.networkParameter.value;
  const benefitTiers = getBenefitTiers(benefitTiersString);

  if (!benefitTiers) {
    return null;
  }

  return (
    <div data-testid="proposal-update-benefit-tiers">
      <RoundedWrapper paddingBottom={true}>
        {benefitTiers && (
          <div
            className="mb-6"
            data-testid="proposal-volume-discount-program-benefit-tiers"
          >
            <h3 className="mb-3 uppercase font-semibold text-lg">
              {t('BenefitTiers')}
            </h3>
            <KeyValueTable>
              {benefitTiers
                .sort(
                  (a, b) =>
                    Number(a.reward_multiplier) - Number(b.reward_multiplier)
                )
                .map((benefitTier, index) => (
                  <div className="mb-4" key={index}>
                    <h4 className="font-semibold uppercase">
                      Tier {index + 1}
                    </h4>
                    {'minimum_activity_streak' in benefitTier && (
                      <KeyValueTableRow
                        data-testid={`mas-${benefitTier.reward_multiplier}`}
                      >
                        <Tooltip
                          description={t(
                            'BenefitTierMinimumActivityStreakDescription'
                          )}
                        >
                          <span>{t('BenefitTierMinimumActivityStreak')}</span>
                        </Tooltip>

                        {benefitTier.minimum_activity_streak}
                      </KeyValueTableRow>
                    )}
                    {'minimum_quantum_balance' in benefitTier && (
                      <KeyValueTableRow
                        data-testid={`mqb-${benefitTier.reward_multiplier}`}
                      >
                        <Tooltip
                          description={t(
                            'BenefitTierMinimumQuantumBalanceDescription'
                          )}
                        >
                          <span>{t('BenefitTierMinimumQuantumBalance')}</span>
                        </Tooltip>

                        {formatMinimumStakedTokens(
                          benefitTier.minimum_quantum_balance,
                          18
                        )}
                      </KeyValueTableRow>
                    )}
                    {'vesting_multiplier' in benefitTier && (
                      <KeyValueTableRow
                        data-testid={`vm-${benefitTier.reward_multiplier}`}
                      >
                        <Tooltip
                          description={t('BenefitTierVestingMultiplier')}
                        >
                          <span>{t('BenefitTierVestingMultiplier')}</span>
                        </Tooltip>
                        {formatReferralRewardMultiplier(
                          benefitTier.vesting_multiplier
                        )}
                      </KeyValueTableRow>
                    )}
                    {'reward_multiplier' in benefitTier && (
                      <KeyValueTableRow
                        data-testid={`rm-${benefitTier.reward_multiplier}`}
                      >
                        <Tooltip description={t('BenefitTierRewardMultiplier')}>
                          <span>{t('BenefitTierRewardMultiplier')}</span>
                        </Tooltip>
                        {formatReferralRewardMultiplier(
                          benefitTier.reward_multiplier
                        )}
                      </KeyValueTableRow>
                    )}
                  </div>
                ))}
            </KeyValueTable>
          </div>
        )}
      </RoundedWrapper>
    </div>
  );
};
