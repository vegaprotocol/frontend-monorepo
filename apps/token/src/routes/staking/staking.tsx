import {
  Button,
  Callout,
  Intent,
  Link as UTLink,
} from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Links } from '../../config';
import { NodeList } from './node-list';
import type { Staking as StakingQueryResult } from './__generated__/Staking';

export const Staking = ({ data }: { data?: StakingQueryResult }) => {
  const { t } = useTranslation();

  return (
    <>
      <section className="mb-8">
        <Callout
          intent={Intent.Primary}
          iconName="help"
          title={t('stakingDescriptionTitle')}
        >
          <ol className="mb-4">
            <li>
              {t('stakingDescription1')}{' '}
              <Link to="/staking/associate" className="underline">
                {t('stakingBridge')}
              </Link>
            </li>
            <li>{t('stakingDescription2')}</li>
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
      <section>
        <h2 className="text-2xl uppercase">{t('Nodes')}</h2>
        <NodeList data-testid="node-list" epoch={data?.epoch} />
      </section>
    </>
  );
};

export default Staking;
