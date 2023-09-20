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
  parentProvider,
}: {
  dataSourceSpecId: string;
  provider: Provider;
  open: boolean;
  onChange?: (isOpen: boolean) => void;
  parentProvider?: Provider;
}) => {
  // If this is a successor market, the parent market data will only have been passed
  // in if it differs from the current data. We'll pass this on to the title component
  // to show a change, but the full profile showing changes is unwieldy - it's enough
  // to know from the title that the oracle has changed.
  const oracleMarkets = useOracleMarkets(provider);
  return (
    <Dialog
      id="oracle-dialog"
      title={
        <OracleProfileTitle
          provider={provider}
          parentProvider={parentProvider}
        />
      }
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
