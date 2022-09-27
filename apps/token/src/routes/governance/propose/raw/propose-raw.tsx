import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEnvironment } from '@vegaprotocol/environment';
import { Heading } from '../../../../components/heading';
import { VegaWalletContainer } from '../../../../components/vega-wallet-container';
import {
  FormGroup,
  InputError,
  ExternalLink,
  TextArea,
} from '@vegaprotocol/ui-toolkit';
import { useProposalSubmit } from '@vegaprotocol/governance';
import {
  ProposalFormSubmit,
  ProposalFormTransactionDialog,
} from '../../components/propose';

export interface RawProposalFormFields {
  rawProposalData: string;
}

export const ProposeRaw = () => {
  const { VEGA_EXPLORER_URL, VEGA_DOCS_URL } = useEnvironment();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<RawProposalFormFields>();
  const { finalizedProposal, submit, Dialog } = useProposalSubmit();

  const hasError = Boolean(errors.rawProposalData?.message);

  const onSubmit = async (fields: RawProposalFormFields) => {
    await submit(JSON.parse(fields.rawProposalData));
  };

  return (
    <>
      <Heading title={t('NewRawProposal')} />
      <VegaWalletContainer>
        {() => (
          <>
            {VEGA_DOCS_URL && (
              <p className="text-sm" data-testid="proposal-docs-link">
                <span className="mr-1">{t('ProposalTermsText')}</span>
                <ExternalLink
                  href={`${VEGA_DOCS_URL}/tutorials/proposals`}
                  target="_blank"
                >{`${VEGA_DOCS_URL}/tutorials/proposals`}</ExternalLink>
              </p>
            )}

            {VEGA_EXPLORER_URL && (
              <p className="text-sm">
                {t('MoreProposalsInfo')}{' '}
                <ExternalLink
                  href={`${VEGA_EXPLORER_URL}/governance`}
                  target="_blank"
                >{`${VEGA_EXPLORER_URL}/governance`}</ExternalLink>
              </p>
            )}

            <div data-testid="raw-proposal-form">
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormGroup
                  label="Make a proposal by submitting JSON"
                  labelFor="proposal-data"
                >
                  <TextArea
                    id="proposal-data"
                    className="min-h-[200px]"
                    hasError={hasError}
                    data-testid="proposal-data"
                    {...register('rawProposalData', {
                      required: t('Required'),
                      validate: {
                        validateJson: (value) => {
                          try {
                            JSON.parse(value);
                            return true;
                          } catch (e) {
                            return t('Must be valid JSON');
                          }
                        },
                      },
                    })}
                  />
                  {errors.rawProposalData?.message && (
                    <InputError intent="danger">
                      {errors.rawProposalData?.message}
                    </InputError>
                  )}
                </FormGroup>
                <ProposalFormSubmit isSubmitting={isSubmitting} />
                <ProposalFormTransactionDialog
                  finalizedProposal={finalizedProposal}
                  TransactionDialog={Dialog}
                />
              </form>
            </div>
          </>
        )}
      </VegaWalletContainer>
    </>
  );
};
