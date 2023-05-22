import { Dialog } from '@vegaprotocol/ui-toolkit';
import {
  OracleProfileTitle,
  OracleFullProfile,
} from '../../components/oracle-full-profile';
import { useOracleMarkets } from '../../hooks';
import type { Provider } from '../../oracle-schema';

export const OracleDialog = ({
  provider,
  dataSourceSpecId,
  open,
  onChange,
}: {
  dataSourceSpecId: string;
  provider: Provider;
  open: boolean;
  onChange?: (isOpen: boolean) => void;
}) => {
  const oracleMarkets = useOracleMarkets(provider);
  return (
    <Dialog
      title={<OracleProfileTitle provider={provider} />}
      aria-labelledby="oracle-proof-dialog"
      open={open}
      onChange={onChange}
    >
      <OracleFullProfile
        provider={provider}
        dataSourceSpecId={dataSourceSpecId}
        markets={oracleMarkets}
      />
    </Dialog>
  );
};
