import { useTranslation } from 'react-i18next';
import { EpochData } from './epoch-data';
import { DocsLinks } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { Heading } from '../../../components/heading';
import React from 'react';

export const Staking = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading title={t('pageTitleValidators')} />
      <section>
        <p className="mb-12">
          {t('stakingIntro')}{' '}
          {DocsLinks && (
            <ExternalLink
              href={DocsLinks.STAKING_GUIDE}
              target="_blank"
              data-testid="staking-guide-link"
              className="text-white"
            >
              {t('readMoreStaking')}
            </ExternalLink>
          )}
        </p>

        <EpochData data-testid="epoch-data" />
      </section>
    </>
  );
};
