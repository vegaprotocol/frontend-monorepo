import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Callout,
  Intent,
  Link as UTLink,
} from '@vegaprotocol/ui-toolkit';
import { createDocsLinks, ExternalLinks } from '@vegaprotocol/react-helpers';
import { useEnvironment } from '@vegaprotocol/environment';
import Routes from '../../../routes/routes';

export const StakingIntro = () => {
  const { t } = useTranslation();
  const { VEGA_DOCS_URL } = useEnvironment();

  return (
    <section className="mb-8" data-testid="staking-intro">
      <Callout
        intent={Intent.Primary}
        iconName="help"
        title={t('stakingDescriptionTitle')}
      >
        <ol className="mb-4">
          <li>
            {t('stakingDescription1')}{' '}
            <Link
              to={Routes.ASSOCIATE}
              className="underline"
              data-testid="staking-associate-link"
            >
              {t('stakingBridge')}
            </Link>
          </li>
          <li>
            {t('stakingDescription2a')} {t('stakingDescription2b')}{' '}
            <UTLink
              href={ExternalLinks.VALIDATOR_FORUM}
              target="_blank"
              data-testid="validator-forum-link"
            >
              {t('onTheForum')}
            </UTLink>
          </li>
          <li>{t('stakingDescription3')}</li>
          <li>{t('stakingDescription4')}</li>
        </ol>
        {VEGA_DOCS_URL && (
          <UTLink
            href={createDocsLinks(VEGA_DOCS_URL).STAKING_GUIDE}
            target="_blank"
            data-testid="staking-guide-link"
          >
            <Button>{t('readMoreStaking')}</Button>
          </UTLink>
        )}
      </Callout>
    </section>
  );
};
