import { useTranslation } from 'react-i18next';
import { StakingIntro } from './staking-intro';
import { NodeList } from './node-list';

export const Staking = () => {
  const { t } = useTranslation();

  return (
    <>
      <StakingIntro />
      <section>
        <h2 className="text-2xl uppercase">{t('Validator nodes')}</h2>
        <NodeList data-testid="node-list" />
      </section>
    </>
  );
};
