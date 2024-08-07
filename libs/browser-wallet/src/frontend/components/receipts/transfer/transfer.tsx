import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import { isBefore } from 'date-fns';
import ReactTimeAgo from 'react-time-ago';

import type { Transaction } from '@/lib/transactions';
import { formatDateTime, nanoSecondsToMilliseconds } from '@/lib/utils';
import { useAssetsStore } from '@/stores/assets-store';
import { useWalletStore } from '@/stores/wallets';

import { VegaKey } from '../../keys/vega-key';
import type { ReceiptComponentProperties } from '../receipts';
import { ReceiptWrapper } from '../utils/receipt-wrapper';
import { BasicTransferView } from './basic-transfer-view';
import { EnrichedTransferView } from './enriched-transfer-view';

const getTime = (transaction: Transaction) => {
  const deliverOn = transaction.transfer?.oneOff?.deliverOn;
  if (deliverOn) {
    const date = nanoSecondsToMilliseconds(deliverOn);
    if (isBefore(date, new Date())) return null;
    return date;
  }
  return null;
};

export const locators = {
  whenSection: 'when-section',
  whenElement: 'when-element',
  loading: 'loading',
};

export const Transfer = ({ transaction }: ReceiptComponentProperties) => {
  const { loading: assetsLoading } = useAssetsStore((state) => ({
    loading: state.loading,
  }));
  // We check whether wallets are loading as wallet data is used to enrich the transfer view
  const { loading: walletsLoading } = useWalletStore((state) => ({
    loading: state.loading,
  }));
  const { getKeyById } = useWalletStore((state) => ({
    getKeyById: state.getKeyById,
  }));
  const keyInfo = getKeyById(transaction.transfer.to);
  const isOwnKey = !!keyInfo;

  if (walletsLoading) return null;
  // Not supporting recurring transfers yet
  if (transaction.transfer.recurring) return null;
  const time = getTime(transaction);
  return (
    <ReceiptWrapper>
      <h1 className="text-vega-dark-300">Amount</h1>

      {assetsLoading ? (
        <BasicTransferView transaction={transaction} />
      ) : (
        <EnrichedTransferView transaction={transaction} />
      )}

      <h1 className="text-vega-dark-300 mt-4">To</h1>
      <VegaKey publicKey={transaction.transfer.to} name={'Receiving key'} />
      {!isOwnKey && (
        <div className="mt-4">
          <Notification
            intent={Intent.None}
            title="External key"
            message="This key is not imported into your app. Please ensure this is the key you want to transfer to before confirming."
          />
        </div>
      )}
      <h1
        className="text-vega-dark-300 mt-4"
        data-testid={locators.whenSection}
      >
        When
      </h1>
      <p data-testid={locators.whenElement}>
        {time ? (
          <>
            <ReactTimeAgo timeStyle="round" date={time} locale="en-US" /> (
            {formatDateTime(time)})
          </>
        ) : (
          'Immediate'
        )}
      </p>
    </ReceiptWrapper>
  );
};
