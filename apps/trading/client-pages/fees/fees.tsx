import { t } from '@vegaprotocol/i18n';
import { FeesContainer } from '../../components/fees-container';

export const Fees = () => {
  return (
    <div className="container p-4 mx-auto">
      <h1 className="px-4 pb-4 text-2xl">{t('Fees')}</h1>
      <FeesContainer />
    </div>
  );
};
