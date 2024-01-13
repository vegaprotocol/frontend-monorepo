import { useTranslation } from 'react-i18next';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import { formatNumber } from '../../../../lib/format-number';
import {
  formatDateWithLocalTimezone,
  formatNumberPercentage,
  toBigNum,
} from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';
import { useAppState } from '../../../../contexts/app-state/app-state-context';

interface ProposalReferralProgramDetailsProps {
  proposal: Extract<
    ProposalQuery['proposal'],
    { __typename?: 'Proposal' }
  > | null;
}

export const formatEndOfProgramTimestamp = (value: string) => {
  return formatDateWithLocalTimezone(new Date(value));
};

export const formatMinimumRunningNotionalTakerVolume = (value: string) => {
  return formatNumber(toBigNum(value, 0), 0);
};

export const formatReferralDiscountFactor = (value: string) => {
  return formatNumberPercentage(new BigNumber(value).times(100));
};

export const formatReferralRewardFactor = (value: string) => {
  return formatNumberPercentage(new BigNumber(value).times(100));
};

export const formatMinimumStakedTokens = (value: string, decimals: number) => {
  return formatNumber(toBigNum(value, decimals));
};

export const formatReferralRewardMultiplier = (value: string) => {
  return `${value}x`;
};

export const ProposalReferralProgramDetails = ({
  proposal,
}: ProposalReferralProgramDetailsProps) => {
  const {
    appState: { decimals },
  } = useAppState();
  const { t } = useTranslation();
  if (proposal?.terms?.change?.__typename !== 'UpdateReferralProgram') {
    return null;
  }

  const benefitTiers = proposal?.terms?.change?.benefitTiers.slice();
  const stakingTiers = proposal?.terms?.change?.stakingTiers.slice();
  const windowLength = proposal?.terms?.change?.windowLength;
  const endOfProgramTimestamp = proposal?.terms?.change?.endOfProgram;

  if (
    !benefitTiers &&
    !stakingTiers &&
    !windowLength &&
    !endOfProgramTimestamp
  ) {
    return null;
  }

  return (
    <div data-testid="proposal-referral-program-details">
      <RoundedWrapper paddingBottom={true}>
        {windowLength && (
          <div data-testid="proposal-referral-program-window-length">
            <KeyValueTable>
              <KeyValueTableRow>
                <Tooltip description={t('WindowLengthDescription')}>
                  <span>{t('WindowLength')}</span>
                </Tooltip>
                {windowLength}
              </KeyValueTableRow>
            </KeyValueTable>
          </div>
        )}

        {endOfProgramTimestamp && (
          <div
            className="mb-6"
            data-testid="proposal-referral-program-end-of-program-timestamp"
          >
            <KeyValueTable>
              <KeyValueTableRow>
                <Tooltip description={t('EndOfProgramTimestampDescription')}>
                  <span>{t('EndOfProgramTimestamp')}</span>
                </Tooltip>
                {formatEndOfProgramTimestamp(endOfProgramTimestamp)}
              </KeyValueTableRow>
            </KeyValueTable>
          </div>
        )}

        {benefitTiers && (
          <div
            className="mb-6"
            data-testid="proposal-referral-program-benefit-tiers"
          >
            <h3 className="mb-3 uppercase font-semibold text-lg">
              {t('BenefitTiers')}
            </h3>
            <KeyValueTable>
              {benefitTiers
                .sort((a, b) => a.minimumEpochs - b.minimumEpochs)
                .map((benefitTier, index) => (
                  <div className="mb-4" key={index}>
                    <h4 className="font-semibold uppercase">
                      Tier {index + 1}
                    </h4>
                    {benefitTier.minimumEpochs && (
                      <KeyValueTableRow>
                        <Tooltip
                          description={t('BenefitTierMinimumEpochsDescription')}
                        >
                          <span>{t('BenefitTierMinimumEpochs')}</span>
                        </Tooltip>
                        {benefitTier.minimumEpochs}
                      </KeyValueTableRow>
                    )}
                    {benefitTier.minimumRunningNotionalTakerVolume && (
                      <KeyValueTableRow>
                        <Tooltip
                          description={t(
                            'BenefitTierMinimumRunningNotionalTakerVolumeDescription'
                          )}
                        >
                          <span>
                            {t('BenefitTierMinimumRunningNotionalTakerVolume')}
                          </span>
                        </Tooltip>
                        {formatMinimumRunningNotionalTakerVolume(
                          benefitTier.minimumRunningNotionalTakerVolume
                        )}
                      </KeyValueTableRow>
                    )}
                    {benefitTier.referralDiscountFactor && (
                      <KeyValueTableRow>
                        <Tooltip
                          description={t(
                            'BenefitTierReferralDiscountFactorDescription'
                          )}
                        >
                          <span>{t('BenefitTierReferralDiscountFactor')}</span>
                        </Tooltip>
                        {formatReferralDiscountFactor(
                          benefitTier.referralDiscountFactor
                        )}
                      </KeyValueTableRow>
                    )}
                    {benefitTier.referralRewardFactor && (
                      <KeyValueTableRow>
                        <Tooltip
                          description={t(
                            'BenefitTierReferralRewardFactorDescription'
                          )}
                        >
                          <span>{t('BenefitTierReferralRewardFactor')}</span>
                        </Tooltip>
                        {formatReferralRewardFactor(
                          benefitTier.referralRewardFactor
                        )}
                      </KeyValueTableRow>
                    )}
                  </div>
                ))}
            </KeyValueTable>
          </div>
        )}

        {stakingTiers && (
          <div data-testid="proposal-referral-program-staking-tiers">
            <h3 className="mb-3 uppercase font-semibold text-lg">
              {t('StakingTiers')}
            </h3>
            <KeyValueTable>
              {stakingTiers
                .sort(
                  (a, b) =>
                    Number(a.minimumStakedTokens) -
                    Number(b.minimumStakedTokens)
                )
                .map((stakingTier, index) => (
                  <div className="mb-4" key={index}>
                    {stakingTier.referralRewardMultiplier && (
                      <KeyValueTableRow>
                        <Tooltip
                          description={t(
                            'StakingTierReferralRewardMultiplierDescription'
                          )}
                        >
                          <span>
                            {t('StakingTierReferralRewardMultiplier')}
                          </span>
                        </Tooltip>
                        {formatReferralRewardMultiplier(
                          stakingTier.referralRewardMultiplier
                        )}
                      </KeyValueTableRow>
                    )}
                    {stakingTier.minimumStakedTokens && (
                      <KeyValueTableRow>
                        <Tooltip
                          description={t(
                            'StakingTierMinimumStakedTokensFactorDescription'
                          )}
                        >
                          <span>{t('StakingTierMinimumStakedTokens')}</span>
                        </Tooltip>
                        {formatMinimumStakedTokens(
                          stakingTier.minimumStakedTokens,
                          decimals
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
