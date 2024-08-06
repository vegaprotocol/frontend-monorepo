import { Intent, Notification } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

import { useAssetsStore } from '@/stores/assets-store';
import { useMarketsStore } from '@/stores/markets-store';

import { VegaSection } from '../../vega-section';

export const locators = {
  receiptWrapper: 'receipt-wrapper',
  receiptWrapperError: 'receipt-wrapper-error',
};

export const ReceiptWrapper = ({
  children,
  errors = [],
}: {
  children: ReactNode;
  errors?: (Error | null)[];
}) => {
  const { error: assetsError } = useAssetsStore((state) => ({
    error: state.error,
  }));
  const { error: marketsError } = useMarketsStore((state) => ({
    error: state.error,
  }));
  const allErrors = [assetsError, marketsError, ...errors].filter(
    Boolean
  ) as Error[];
  const hasError = allErrors.length > 0;
  return (
    <VegaSection>
      {!hasError && (
        <section data-testid={locators.receiptWrapper}>{children}</section>
      )}
      {hasError ? (
        <div className="mt-4">
          <Notification
            intent={Intent.Warning}
            testId={locators.receiptWrapperError}
            title="Error loading data"
            message="Additional data to display your transaction could not be loaded. The transaction can still be sent, but only transaction data can be shown."
            buttonProps={{
              action: () => {
                navigator.clipboard.writeText(
                  allErrors.map((error) => error.stack).join('. \n')
                );
              },
              text: 'Copy error message(s)',
            }}
          />
        </div>
      ) : null}
    </VegaSection>
  );
};
