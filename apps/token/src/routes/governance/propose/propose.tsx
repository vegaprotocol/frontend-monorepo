import Routes from '../../routes';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Heading } from '../../../components/heading';
import { Links } from '../../../config';

export const Propose = () => {
  const { t } = useTranslation();
  const linkStyles = classnames('block underline mb-8');

  return (
    <>
      <section className="pb-20">
        <Heading title={t('NewProposal')} />
        <p>
          {t('words words words read more on')}{' '}
          <Link to={Links.PROPOSALS_GUIDE} target="_blank">
            {Links.PROPOSALS_GUIDE}
          </Link>{' '}
        </p>
      </section>

      <section>
        <h2 className="text-h5">{t('ProposalTypeQuestion')}</h2>
        <ul>
          <li>
            <Link
              to={`${Routes.GOVERNANCE}/propose/network-parameter`}
              className={linkStyles}
            >
              Network parameter
            </Link>
          </li>
          <li>
            <Link
              to={`${Routes.GOVERNANCE}/propose/new-market`}
              className={linkStyles}
            >
              New market
            </Link>
          </li>
          <li>
            <Link
              to={`${Routes.GOVERNANCE}/propose/change-market`}
              className={linkStyles}
            >
              Change market
            </Link>
          </li>
          <li>
            <Link
              to={`${Routes.GOVERNANCE}/propose/new-asset`}
              className={linkStyles}
            >
              New asset
            </Link>
          </li>
          <li>
            <Link
              to={`${Routes.GOVERNANCE}/propose/freeform`}
              className={linkStyles}
            >
              Freeform
            </Link>
          </li>
          <li>
            <Link
              to={`${Routes.GOVERNANCE}/propose/raw`}
              className={linkStyles}
            >
              Let me choose (raw proposal)
            </Link>
          </li>
        </ul>
      </section>
    </>
  );
};
