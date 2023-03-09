import { useTranslation } from 'react-i18next';
import { EpochData } from './epoch-data';
import { useEnvironment } from '@vegaprotocol/environment';
import { ExternalLink } from '@vegaprotocol/ui-toolkit';
import { createDocsLinks } from '@vegaprotocol/utils';
import { Heading } from '../../../components/heading';
import React from 'react';

export const Staking = () => {
  const { t } = useTranslation();
  const { VEGA_DOCS_URL } = useEnvironment();

  return (
    <>
      <Heading title={t('pageTitleValidators')} />
      <section>
        <p className="mb-12">
          {t('stakingIntro')}{' '}
          {VEGA_DOCS_URL && (
            <ExternalLink
              href={createDocsLinks(VEGA_DOCS_URL).STAKING_GUIDE}
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
