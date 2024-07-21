import { OracleDialog } from '@vegaprotocol/markets';
import { useT } from '../../../lib/use-t';
import { HeaderStat } from '../../header';
import { useState } from 'react';
import { useSettlementDataOracleProvider } from '@vegaprotocol/data-provider';

export const Oracle = ({ marketId }: { marketId: string }) => {
  const t = useT();

  const [open, setOpen] = useState(false);
  const { data } = useSettlementDataOracleProvider(marketId);

  if (!data?.provider) return null;

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
