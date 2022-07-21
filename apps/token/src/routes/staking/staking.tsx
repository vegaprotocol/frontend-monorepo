import { Button, Callout, Intent, Link } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { Links } from '../../config';
import { NodeList } from './node-list';
import type { Staking as StakingQueryResult } from './__generated__/Staking';
import { useMatch } from 'react-router-dom';
import React from 'react';
import { Heading } from '../../components/heading';

export const Staking = ({ data }: { data?: StakingQueryResult }) => {
  const { t } = useTranslation();
  const associate = useMatch('/staking/associate');
  const disassociate = useMatch('/staking/disassociate');

  const title = React.useMemo(() => {
    if (associate) {
      return t('pageTitleAssociate');
    } else if (disassociate) {
      return t('pageTitleDisassociate');
    }
    return t('pageTitleStaking');
  }, [associate, disassociate, t]);

  return (
    <>
      <Heading title={title} />
      <section className="mb-20">
        <Callout
          intent={Intent.Primary}
          iconName="help"
          title={t('stakingDescriptionTitle')}
        >
          <ol className="mb-20">
            <li>{t('stakingDescription1')}</li>
            <li>{t('stakingDescription2')}</li>
            <li>{t('stakingDescription3')}</li>
            <li>{t('stakingDescription4')}</li>
          </ol>

          <Link
            href={Links.STAKING_GUIDE}
            target="_blank"
            data-testid="staking-guide-link"
          >
            <Button variant="secondary">{t('readMoreStaking')}</Button>
          </Link>
        </Callout>
      </section>

      <section data-testid="validators-grid">
        <h2 className="text-h4 uppercase">{t('Nodes')}</h2>
        <NodeList data-testid="node-list" epoch={data?.epoch} />
      </section>
    </>
  );
};
