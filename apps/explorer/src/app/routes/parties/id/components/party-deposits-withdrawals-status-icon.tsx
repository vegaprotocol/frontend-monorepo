import {
  DepositStatusMapping,
  WithdrawalStatusMapping,
} from '@vegaprotocol/types';
import { Icon } from '@vegaprotocol/ui-toolkit';
import { isDepositStatus } from './lib/combine-deposits-withdrawals';

import type { DepositStatus, WithdrawalStatus } from '@vegaprotocol/types';
import { t } from '@vegaprotocol/i18n';

export type DepositWithdrawalStatusIconProps = {
  status?: DepositStatus | WithdrawalStatus;
  hash?: string | null;
};

export const DepositWithdrawalStatusIcon = ({
  status,
  hash,
}: DepositWithdrawalStatusIconProps) => {
  if (status === 'STATUS_FINALIZED') {
    if (hash) {
      return <Icon name="tick" />;
    } else {
      return <Icon name="time" />;
    }
  } else if (status === 'STATUS_OPEN') {
    return <Icon name="time" />;
  } else {
    return <Icon name="cross" />;
  }
};

/**
 * Produces a label based on the status of a deposit or withdrawal. In the
 * case of a finalized deposit, it will also check if the hash is present
 * and use that to produce a label that isn't in the standard label mapping.
 *
 * @param status
 * @param hash
 * @returns string Label to
 */
export function getDepositWithdrawalStatusLabel(
  status?: DepositStatus | WithdrawalStatus,
  hash?: string | null
) {
  if (status !== undefined) {
    if (status === 'STATUS_FINALIZED') {
      if (hash) {
        return t('Complete');
      } else {
        return t('Incomplete');
      }
    }

    if (isDepositStatus(status)) {
      return DepositStatusMapping[status];
    } else {
      return WithdrawalStatusMapping[status];
    }
  }

  return t('Unknown');
}
