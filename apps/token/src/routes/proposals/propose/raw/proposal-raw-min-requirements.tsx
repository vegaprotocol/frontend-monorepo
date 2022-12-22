import { useTranslation } from 'react-i18next';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { formatMinRequiredBalance } from '../../components/shared';
import type { ReactNode } from 'react';

export interface ProposalRawMinRequirementsProps {
  assetMin: string;
  updateAssetMin: string;
  marketMin: string;
  updateMarketMin: string;
  updateNetParamMin: string;
  freeformMin: string;
  spamProtectionMin: string;
}

const Wrapper = ({ children }: { children: ReactNode }) => (
  <div className="mb-4" data-testid="proposal-raw-min-requirements">
    {children}
  </div>
);

export const ProposalRawMinRequirements = ({
  assetMin,
  updateAssetMin,
  marketMin,
  updateMarketMin,
  updateNetParamMin,
  freeformMin,
  spamProtectionMin,
}: ProposalRawMinRequirementsProps) => {
  const { t } = useTranslation();
  if (
    assetMin <= spamProtectionMin &&
    updateAssetMin <= spamProtectionMin &&
    marketMin <= spamProtectionMin &&
    updateMarketMin <= spamProtectionMin &&
    updateNetParamMin <= spamProtectionMin &&
    freeformMin <= spamProtectionMin
  ) {
    return (
      <Wrapper>
        {t('MinProposalRequirements', {
          value: Number(formatMinRequiredBalance(spamProtectionMin)),
        })}
      </Wrapper>
    );
  }

  if (
    assetMin === updateAssetMin &&
    assetMin === marketMin &&
    assetMin === updateMarketMin &&
    assetMin === updateNetParamMin &&
    assetMin === freeformMin
  ) {
    return (
      <Wrapper>
        {t('MinProposalRequirements', {
          value: Number(formatMinRequiredBalance(assetMin)),
        })}
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="mb-4">
        {t(
          'Different proposal types can have different minimum token requirements. You must have the greater of the proposal minimum or spam protection minimum from the table below'
        )}
      </div>
      <KeyValueTable>
        <KeyValueTableRow>
          {t('NewAsset')}
          {`${formatMinRequiredBalance(assetMin).toString()} VEGA`}
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('UpdateAsset')}
          {`${formatMinRequiredBalance(updateAssetMin).toString()} VEGA`}
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('NewMarket')}
          {`${formatMinRequiredBalance(marketMin).toString()} VEGA`}
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('UpdateMarket')}
          {`${formatMinRequiredBalance(updateMarketMin).toString()} VEGA`}
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('NetworkParameter')}
          {`${formatMinRequiredBalance(updateNetParamMin).toString()} VEGA`}
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('Freeform')}
          {`${formatMinRequiredBalance(freeformMin).toString()} VEGA`}
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('SpamProtectionMin')}
          {`${formatMinRequiredBalance(spamProtectionMin).toString()} VEGA`}
        </KeyValueTableRow>
      </KeyValueTable>
    </Wrapper>
  );
};
