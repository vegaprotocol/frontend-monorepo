import { Callout } from '@vegaprotocol/ui-toolkit';
import { useBalances } from '../../../lib/balances/balances-store';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { TokenInput } from '../../../components/token-input';
import { BigNumber } from '../../../lib/bignumber';
import { AssociateInfo } from './associate-info';

export const ContractAssociate = ({
  perform,
  amount,
  setAmount,
  vegaKey,
}: {
  perform: () => void;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  vegaKey: string | null;
}) => {
  const { t } = useTranslation();
  const { balanceFormatted, lien } = useBalances();

  const maximum = React.useMemo(() => {
    return new BigNumber(balanceFormatted).minus(lien);
  }, [balanceFormatted, lien]);

  let pageContent = null;
  if (new BigNumber(balanceFormatted).isEqualTo('0')) {
    pageContent = (
      <div className="text-intent-danger">
        {t('You have no VEGA tokens currently vesting.')}
      </div>
    );
  } else if (new BigNumber(balanceFormatted).minus(lien).isEqualTo('0')) {
    pageContent = (
      <div className="text-intent-danger">
        {t(
          'All VEGA tokens vesting in the connected wallet have already been associated.'
        )}
      </div>
    );
  } else {
    pageContent = (
      <>
        <Callout>
          {t(
            'You can associate tokens while they are held in the vesting contract, when they unlock you will need to dissociate them before they can be redeemed.'
          )}
        </Callout>
        <AssociateInfo pubKey={vegaKey ? vegaKey : null} />
        <TokenInput
          submitText={t('Associate VEGA Tokens with key')}
          perform={perform}
          maximum={maximum}
          amount={amount}
          setAmount={setAmount}
          currency={t('VEGA Tokens')}
        />
      </>
    );
  }

  return (
    <section className="contract-associate" data-testid="contract-associate">
      {pageContent}
    </section>
  );
};
