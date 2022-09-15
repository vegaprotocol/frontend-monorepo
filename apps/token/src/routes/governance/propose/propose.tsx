import Routes from '../../routes';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from '@vegaprotocol/ui-toolkit';
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
              <Link
                href={`${VEGA_DOCS_URL}/tutorials/proposals`}
                target="_blank"
              >{`${VEGA_DOCS_URL}/tutorials/proposals`}</Link>
            </p>
          )}
          {VEGA_EXPLORER_URL && (
            <p>
              {t('MoreProposalsInfo')}{' '}
              <Link
                href={`${VEGA_EXPLORER_URL}/governance`}
                target="_blank"
              >{`${VEGA_EXPLORER_URL}/governance`}</Link>
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-h5">{t('ProposalTypeQuestion')}</h2>
        <ul>
          <li>
            <p>
              <Link href={`${Routes.GOVERNANCE}/propose/network-parameter`}>
                {t('NetworkParameter')}
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link href={`${Routes.GOVERNANCE}/propose/new-market`}>
                {t('NewMarket')}
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link href={`${Routes.GOVERNANCE}/propose/update-market`}>
                {t('UpdateMarket')}
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link href={`${Routes.GOVERNANCE}/propose/new-asset`}>
                {t('NewAsset')}
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link href={`${Routes.GOVERNANCE}/propose/freeform`}>
                {t('Freeform')}
              </Link>
            </p>
          </li>
          <li>
            <p>
              <Link href={`${Routes.GOVERNANCE}/propose/raw`}>
                {t('RawProposal')}
              </Link>
            </p>
          </li>
        </ul>
      </section>
    </>
  );
};
