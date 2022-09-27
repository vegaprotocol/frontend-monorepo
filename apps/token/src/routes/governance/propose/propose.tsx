import Routes from '../../routes';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { Heading } from '../../../components/heading';

export const Propose = () => {
  const { VEGA_DOCS_URL, VEGA_EXPLORER_URL } = useEnvironment();
  const { t } = useTranslation();

  return (
    <>
      <section className="pb-6">
        <Heading title={t('NewProposal')} />
        <div className="text-sm">
          {VEGA_DOCS_URL && (
            <p>
              <span className="mr-1">{t('ProposalTermsText')}</span>
              <ExternalLink
                href={`${VEGA_DOCS_URL}/tutorials/proposals`}
                target="_blank"
              >{`${VEGA_DOCS_URL}/tutorials/proposals`}</ExternalLink>
            </p>
          )}
          {VEGA_EXPLORER_URL && (
            <p>
              {t('MoreProposalsInfo')}{' '}
              <ExternalLink
                href={`${VEGA_EXPLORER_URL}/governance`}
                target="_blank"
              >{`${VEGA_EXPLORER_URL}/governance`}</ExternalLink>
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-h5">{t('ProposalTypeQuestion')}</h2>
        <ul>
          <li>
            <p>
              <ExternalLink
                href={`${Routes.GOVERNANCE}/propose/network-parameter`}
              >
                {t('NetworkParameter')}
              </ExternalLink>
            </p>
          </li>
          <li>
            <p>
              <ExternalLink href={`${Routes.GOVERNANCE}/propose/new-market`}>
                {t('NewMarket')}
              </ExternalLink>
            </p>
          </li>
          <li>
            <p>
              <ExternalLink href={`${Routes.GOVERNANCE}/propose/update-market`}>
                {t('UpdateMarket')}
              </ExternalLink>
            </p>
          </li>
          <li>
            <p>
              <ExternalLink href={`${Routes.GOVERNANCE}/propose/new-asset`}>
                {t('NewAsset')}
              </ExternalLink>
            </p>
          </li>
          <li>
            <p>
              <ExternalLink href={`${Routes.GOVERNANCE}/propose/freeform`}>
                {t('Freeform')}
              </ExternalLink>
            </p>
          </li>
          <li>
            <p>
              <ExternalLink href={`${Routes.GOVERNANCE}/propose/raw`}>
                {t('RawProposal')}
              </ExternalLink>
            </p>
          </li>
        </ul>
      </section>
    </>
  );
};
