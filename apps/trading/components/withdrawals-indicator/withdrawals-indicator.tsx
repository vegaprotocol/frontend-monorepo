import { Tooltip } from '@vegaprotocol/ui-toolkit';
import { useIncompleteWithdrawals } from '../../lib/hooks/use-incomplete-withdrawals';
import { useT } from '../../lib/use-t';

export const WithdrawalsIndicator = () => {
  const t = useT();
  const { ready } = useIncompleteWithdrawals();
  if (!ready || ready.length === 0) {
    return null;
  }
  return (
    <Tooltip
      description={t('withdrawalsIncompleteTooltip', {
        count: ready.length,
      })}
    >
      <span className="p-1 text-2xs leading-none rounded bg-surface-3">
        {ready.length}
      </span>
    </Tooltip>
  );
};
