import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ProposalForm } from '@vegaprotocol/governance';
import { Heading } from '../../../components/heading';
import { VegaWalletContainer } from '../../../components/vega-wallet-container';
import { Links } from '../../../config';

export const Propose = () => {
  const { t } = useTranslation();
  return (
    <>
      <Heading title={t('NewProposal')} />
      <p>
        {t('words words words read more on')}{' '}
        <Link to={Links.PROPOSALS_GUIDE} target="_blank">
          {Links.PROPOSALS_GUIDE}
        </Link>{' '}
      </p>
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
