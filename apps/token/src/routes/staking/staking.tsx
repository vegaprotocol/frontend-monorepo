import { Button, Callout, Intent, Link } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { Links } from '../../config';
import { NodeList } from './node-list';
import type { Staking as StakingQueryResult } from './__generated__/Staking';

export const Staking = ({ data }: { data?: StakingQueryResult }) => {
  const { t } = useTranslation();

  return (
    <>
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

      <section>
        <h2 className="text-h4 uppercase">{t('Nodes')}</h2>
        <NodeList data-testid="node-list" epoch={data?.epoch} />
      </section>
    </>
  );
};
