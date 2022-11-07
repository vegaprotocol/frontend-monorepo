import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Callout,
  Intent,
  Link as UTLink,
} from '@vegaprotocol/ui-toolkit';
import { ExternalLinks as Links } from '@vegaprotocol/react-helpers';

export const StakingIntro = () => {
  const { t } = useTranslation();

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
              to="/staking/associate"
              className="underline"
              data-testid="staking-associate-link"
            >
              {t('stakingBridge')}
            </Link>
          </li>
          <li>
            {t('stakingDescription2')}{' '}
            <UTLink
              href={Links.VALIDATOR_FORUM}
              target="_blank"
              data-testid="validator-forum-link"
            >
              {t('onTheForum')}
            </UTLink>
          </li>
          <li>{t('stakingDescription3')}</li>
          <li>{t('stakingDescription4')}</li>
        </ol>

        <UTLink
          href={Links.STAKING_GUIDE}
          target="_blank"
          data-testid="staking-guide-link"
        >
          <Button>{t('readMoreStaking')}</Button>
        </UTLink>
      </Callout>
    </section>
  );
};
