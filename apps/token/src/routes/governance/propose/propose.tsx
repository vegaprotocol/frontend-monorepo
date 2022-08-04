import { useTranslation } from 'react-i18next';
import { ProposalForm } from './proposal-form';
import {
  useProposalSubmit,
  getProposalDialogTitle,
  getProposalDialogIcon,
  getProposalDialogIntent,
} from '@vegaprotocol/governance';
import { Heading } from '../../../components/heading';
import { VegaTxStatus } from '@vegaprotocol/wallet';
import { VegaWalletContainer } from '../../../components/vega-wallet-container';

export const Propose = () => {
  const { t } = useTranslation();
  const { finalizedProposal, submit, transaction, TransactionDialog } =
    useProposalSubmit();

  const transactionStatus =
    transaction.status === VegaTxStatus.Requested ||
    transaction.status === VegaTxStatus.Pending
      ? 'pending'
      : 'default';

  return (
    <>
      <Heading title={t('NewProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            <p>{t('MinProposalRequirements')}</p>
            <ProposalForm
              onSubmit={async (fields) => {
                if (transactionStatus !== 'pending') {
                  await submit(JSON.parse(fields.proposalData));
                }
              }}
            />
            <TransactionDialog
              title={getProposalDialogTitle(finalizedProposal?.state)}
              intent={getProposalDialogIntent(finalizedProposal?.state)}
              icon={getProposalDialogIcon(finalizedProposal?.state)}
            />
          </>
        )}
      </VegaWalletContainer>
    </>
  );
};
