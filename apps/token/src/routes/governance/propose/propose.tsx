import Routes from '../../routes';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { Heading } from '../../../components/heading';
import { ProposalDocsLink } from '../components/propose';

export const Propose = () => {
  const { VEGA_DOCS_URL, VEGA_EXPLORER_URL } = useEnvironment();
  const { t } = useTranslation();
  const linkStyles = classnames('block underline mb-2');

  return (
    <>
      <section className="pb-6">
        <Heading title={t('NewProposal')} />
        {VEGA_DOCS_URL && <ProposalDocsLink url={VEGA_DOCS_URL} />}
        {VEGA_EXPLORER_URL && (
          <p>
            {t('MoreProposalsInfo')}{' '}
            <Link
              href={`${VEGA_EXPLORER_URL}/governance`}
              target="_blank"
            >{`${VEGA_EXPLORER_URL}/governance`}</Link>
          </p>
        )}
      </section>

      <section>
        <h2 className="text-h5">{t('ProposalTypeQuestion')}</h2>
        <ul>
          <li>
            <Link
              href={`${Routes.GOVERNANCE}/propose/network-parameter`}
              className={linkStyles}
            >
              {t('NetworkParameter')}
            </Link>
          </li>
          <li>
            <Link
              href={`${Routes.GOVERNANCE}/propose/new-market`}
              className={linkStyles}
            >
              {t('NewMarket')}
            </Link>
          </li>
          <li>
            <Link
              href={`${Routes.GOVERNANCE}/propose/update-market`}
              className={linkStyles}
            >
              {t('UpdateMarket')}
            </Link>
          </li>
          <li>
            <Link
              href={`${Routes.GOVERNANCE}/propose/new-asset`}
              className={linkStyles}
            >
              {t('NewAsset')}
            </Link>
          </li>
          <li>
            <Link
              href={`${Routes.GOVERNANCE}/propose/freeform`}
              className={linkStyles}
            >
              {t('Freeform')}
            </Link>
          </li>
          <li>
            <Link
              href={`${Routes.GOVERNANCE}/propose/raw`}
              className={linkStyles}
            >
              {t('RawProposal')}
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
};
