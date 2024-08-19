import { useTranslation } from 'react-i18next';
import { Button, Intent } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';

interface ProposalFormSubmitProps {
  isSubmitting: boolean;
}

export const ProposalFormSubmit = ({
  isSubmitting,
}: ProposalFormSubmitProps) => {
  const { pubKey } = useVegaWallet();
  const { t } = useTranslation();
  return (
    <div className="mb-6">
      <div className="mb-4 font-bold uppercase text-orange">
        {!pubKey && t('connectWalletToSubmitProposal')}
      </div>
      <VegaWalletContainer>
        {() => (
          <Button
            intent={Intent.Primary}
            type="submit"
            data-testid="proposal-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('submittingProposal') : t('submitProposal')}
          </Button>
        )}
      </VegaWalletContainer>
    </div>
  );
};
