import { OracleDialog, useMarketOracle } from '@vegaprotocol/markets';
import { useT } from '../../../lib/use-t';
import { HeaderStat } from '../../header';
import { useState } from 'react';

export const Oracle = ({ marketId }: { marketId: string }) => {
  const t = useT();

  const [open, setOpen] = useState(false);
  const { data } = useMarketOracle(marketId, 'dataSourceSpecForSettlementData');

  if (!data) return null;

  return (
    <HeaderStat heading={t('Oracle')}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="underline underline-offset-4 capitalize"
      >
        {data.provider.type.toLowerCase()}
      </button>
      <OracleDialog open={open} onChange={setOpen} {...data} />
    </HeaderStat>
  );
};
