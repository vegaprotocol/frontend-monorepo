import { AccountsContainer } from '@vegaprotocol/accounts';
import { t } from '@vegaprotocol/react-helpers';

export const Portfolio = () => {
  return (
    <section>
      <h2 className="text-lg mb-16">{t('Assets')}</h2>
      <div className="h-screen">
        <AccountsContainer />
      </div>
    </section>
  );
};
