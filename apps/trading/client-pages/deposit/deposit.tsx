import { DepositContainer } from '@vegaprotocol/deposits';
import { GetStarted } from '../../components/welcome-dialog';
import { t } from '@vegaprotocol/i18n';

export const Deposit = () => {
  return (
    <div className="flex justify-center w-full px-8 py-16">
      <div className="lg:min-w-[700px] min-w-[300px] max-w-[700px]">
        <h1 className="text-4xl uppercase xl:text-5xl font-alpha calt">
          {t('Deposit')}
        </h1>
        <div className="mt-10">
          <DepositContainer />
          <GetStarted />
        </div>
      </div>
    </div>
  );
};
