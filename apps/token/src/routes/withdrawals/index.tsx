import { Button, Dialog as UIDialog, Splash } from '@vegaprotocol/ui-toolkit';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import { Heading } from '../../components/heading';
import { KeyValueTable, KeyValueTableRow } from '@vegaprotocol/ui-toolkit';
import { SplashLoader } from '../../components/splash-loader';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { BigNumber } from '../../lib/bignumber';
import { DATE_FORMAT_DETAILED } from '../../lib/date-formats';
import { addDecimal } from '../../lib/decimals';
import { truncateMiddle } from '../../lib/truncate-middle';
import type { WithdrawalFields } from '@vegaprotocol/withdraws';
import { WithdrawalsTable } from '@vegaprotocol/withdraws';
import { WithdrawFormContainer } from '@vegaprotocol/withdraws';
import { useCompleteWithdraw, useWithdrawals } from '@vegaprotocol/withdraws';
import { WithdrawalStatus } from '@vegaprotocol/types';
import { useState } from 'react';
import { useVegaWallet } from '@vegaprotocol/wallet';

const Withdrawals = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading title={t('withdrawalsTitle')} />
      <VegaWalletContainer>
        {(currVegaKey) => <WithdrawPendingContainer />}
      </VegaWalletContainer>
    </>
  );
};

const WithdrawPendingContainer = () => {
  const { keypair } = useVegaWallet();
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const { t } = useTranslation();
  const { submit, Dialog } = useCompleteWithdraw();
  const { withdrawals, loading, error } = useWithdrawals();

  if (error) {
    return (
      <section>
        <p>{t('Something went wrong')}</p>
        {error && <pre>{error.message}</pre>}
      </section>
    );
  }

  if (loading) {
    return (
      <Splash>
        <SplashLoader />
      </Splash>
    );
  }

  if (!withdrawals.length) {
    return <p>{t('withdrawalsNone')}</p>;
  }

  return (
    <>
      <header className="flex items-start justify-between">
        <h2>{t('withdrawalsPreparedWarningHeading')}</h2>
        <Button onClick={() => setWithdrawDialog(true)}>Withdraw</Button>
      </header>
      <p>{t('withdrawalsText')}</p>
      <p className="mb-8">{t('withdrawalsPreparedWarningText')}</p>
      <div className="w-full h-[500px]">
        <WithdrawalsTable withdrawals={withdrawals} />
      </div>
      <UIDialog
        title={t('Withdraw')}
        open={withdrawDialog}
        onChange={(isOpen) => setWithdrawDialog(isOpen)}
      >
        <WithdrawFormContainer partyId={keypair?.pub} />
      </UIDialog>
    </>
  );
};

interface WithdrawalProps {
  withdrawal: WithdrawalFields;
  complete: (withdrawalId: string) => void;
}

export const Withdrawal = ({ withdrawal, complete }: WithdrawalProps) => {
  const { ETHERSCAN_URL } = useEnvironment();
  const { t } = useTranslation();
  let status;
  let footer = null;

  if (withdrawal.pendingOnForeignChain) {
    status = t('Pending');
    footer = (
      <Button
        fill={true}
        disabled={true}
        onClick={() => complete(withdrawal.id)}
      >
        {t('withdrawalsCompleteButton')}
      </Button>
    );
  } else if (withdrawal.status === WithdrawalStatus.STATUS_FINALIZED) {
    if (withdrawal.txHash) {
      status = t('Complete');
    } else {
      status = t('Incomplete');
      footer = (
        <Button fill={true} onClick={() => complete(withdrawal.id)}>
          {t('withdrawalsCompleteButton')}
        </Button>
      );
    }
  } else {
    status = withdrawal.status;
  }

  return (
    <div>
      <KeyValueTable>
        <KeyValueTableRow>
          {t('Withdraw')}
          <span>
            {addDecimal(
              new BigNumber(withdrawal.amount),
              withdrawal.asset.decimals
            )}{' '}
            {withdrawal.asset.symbol}
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('toEthereum')}
          <span>
            <Link
              title={t('View on Etherscan (opens in a new tab)')}
              href={`${ETHERSCAN_URL}/tx/${withdrawal.details?.receiverAddress}`}
              target="_blank"
            >
              {truncateMiddle(withdrawal.details?.receiverAddress ?? '')}
            </Link>
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('created')}
          <span>
            {format(
              new Date(withdrawal.createdTimestamp),
              DATE_FORMAT_DETAILED
            )}
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('withdrawalTransaction', { foreignChain: 'Ethereum' })}
          <span>
            {withdrawal.txHash ? (
              <Link
                title={t('View transaction on Etherscan')}
                href={`${ETHERSCAN_URL}/tx/${withdrawal.txHash}`}
                target="_blank"
              >
                {truncateMiddle(withdrawal.txHash)}
              </Link>
            ) : (
              '-'
            )}
          </span>
        </KeyValueTableRow>
        <KeyValueTableRow>
          {t('status')}
          {status}
        </KeyValueTableRow>
      </KeyValueTable>
      {footer}
    </div>
  );
};

export default Withdrawals;
