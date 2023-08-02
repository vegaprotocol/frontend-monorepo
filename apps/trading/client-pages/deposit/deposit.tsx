import { DepositContainer } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/i18n';

export const Deposit = () => {
  return (
    <div className="py-16 px-8 flex w-full justify-center">
      <div className="lg:min-w-[700px] min-w-[300px] max-w-[700px]">
        <h1 className="text-4xl xl:text-5xl uppercase font-alpha calt">
          {t('Deposit')}
        </h1>
        <div className="mt-10">
          <DepositContainer />
        </div>
      </div>
    </div>
  );
};
