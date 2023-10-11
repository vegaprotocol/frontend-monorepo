import { useTranslation } from 'react-i18next';
import type { ProposalQuery } from '../../proposal/__generated__/Proposal';
import {
  KeyValueTable,
  KeyValueTableRow,
  RoundedWrapper,
  Tooltip,
} from '@vegaprotocol/ui-toolkit';
import {
  formatEndOfProgramTimestamp,
  formatMinimumRunningNotionalTakerVolume,
} from '../proposal-referral-program-details';
import { formatNumberPercentage } from '@vegaprotocol/utils';
import BigNumber from 'bignumber.js';

interface ProposalReferralProgramDetailsProps {
  proposal: ProposalQuery['proposal'];
}

export const formatVolumeDiscountFactor = (value: string) => {
  return formatNumberPercentage(new BigNumber(value).times(100));
};

export const ProposalVolumeDiscountProgramDetails = ({
  proposal,
}: ProposalReferralProgramDetailsProps) => {
  const { t } = useTranslation();
  if (proposal?.terms?.change?.__typename !== 'UpdateVolumeDiscountProgram') {
    return null;
  }

  const benefitTiers = proposal?.terms?.change?.benefitTiers;
  const windowLength = proposal?.terms?.change?.windowLength;
  const endOfProgramTimestamp = proposal?.terms?.change?.endOfProgramTimestamp;

  if (!benefitTiers && !windowLength && !endOfProgramTimestamp) {
    return null;
  }

  return (
    <div data-testid="proposal-volume-discount-program-details">
      <RoundedWrapper paddingBottom={true}>
        {windowLength && (
          <div data-testid="proposal-volume-discount-program-window-length">
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
            data-testid="proposal-volume-discount-program-end-of-program-timestamp"
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
            data-testid="proposal-volume-discount-program-benefit-tiers"
          >
            <h3 className="mb-3 uppercase font-semibold text-lg">
              {t('BenefitTiers')}
            </h3>
            <KeyValueTable>
              {benefitTiers
                .sort(
                  (a, b) =>
                    Number(a.minimumRunningNotionalTakerVolume) -
                    Number(b.minimumRunningNotionalTakerVolume)
                )
                .map((benefitTier, index) => (
                  <div className="mb-4" key={index}>
                    <h4 className="font-semibold uppercase">
                      Tier {index + 1}
                    </h4>
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
                    {benefitTier.volumeDiscountFactor && (
                      <KeyValueTableRow>
                        <Tooltip
                          description={t(
                            'BenefitTierVolumeDiscountFactorDescription'
                          )}
                        >
                          <span>{t('BenefitTierVolumeDiscountFactor')}</span>
                        </Tooltip>
                        {formatVolumeDiscountFactor(
                          benefitTier.volumeDiscountFactor
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
