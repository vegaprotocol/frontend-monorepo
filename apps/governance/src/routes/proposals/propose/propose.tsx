import Routes from '../../routes';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { Heading } from '../../../components/heading';
import { createDocsLinks } from '@vegaprotocol/utils';

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
                href={createDocsLinks(VEGA_DOCS_URL).PROPOSALS_GUIDE}
                target="_blank"
              >
                {createDocsLinks(VEGA_DOCS_URL).PROPOSALS_GUIDE}
              </ExternalLink>
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
        <h2 className="text-h5">{t('CreateProposalAndDownloadJSONToShare')}</h2>
        <ul className="mb-6">
          <li>
            <p>
              <Link
                className="underline"
                to={`${Routes.PROPOSALS}/propose/network-parameter`}
              >
                {t('NetworkParameter')}
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link
                className="underline"
                to={`${Routes.PROPOSALS}/propose/new-market`}
              >
                {t('NewMarket')}
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link
                className="underline"
                to={`${Routes.PROPOSALS}/propose/update-market`}
              >
                {t('UpdateMarket')}
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link
                className="underline"
                to={`${Routes.PROPOSALS}/propose/new-asset`}
              >
                {t('NewAsset')}
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link
                className="underline"
                to={`${Routes.PROPOSALS}/propose/update-asset`}
              >
                {t('UpdateAsset')}
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link
                className="underline"
                to={`${Routes.PROPOSALS}/propose/freeform`}
              >
                {t('Freeform')}
              </Link>
            </p>
          </li>
        </ul>

        <h2 className="text-h5">{t('SubmitAnAgreedProposalFromTheForum')}</h2>
        <p>
          <Link className="underline" to={`${Routes.PROPOSALS}/propose/raw`}>
            {t('SubmitAgreedRawProposal')}
          </Link>
        </p>
      </section>
    </>
  );
};
