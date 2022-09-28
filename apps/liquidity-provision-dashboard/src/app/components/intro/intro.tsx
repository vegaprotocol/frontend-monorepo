import { t } from '@vegaprotocol/react-helpers';
const Intro = () => {
  return (
    <div className="px-6 py-6" data-testid="intro">
      <h2 className="text-2xl">{t('Become a liquidity provider')}</h2>
      <p className="text-base">{t('Earn a cut...')}</p>
    </div>
  );
};

export default Intro;
