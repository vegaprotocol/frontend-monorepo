import { useTranslation } from 'react-i18next';
import { ProposalForm } from '@vegaprotocol/governance';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';

export const ProposeNetworkParameter = () => {
  const { t } = useTranslation();
  return (
    <>
      <Heading title={t('NetworkParameterProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <p>{t('MinProposalRequirements')}</p>
            <ProposalForm />
          </>
        )}
      </VegaWalletContainer>
    </>
  );
};
