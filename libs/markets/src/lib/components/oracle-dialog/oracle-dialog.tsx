import { Dialog } from '@vegaprotocol/ui-toolkit';
import {
  OracleProfileTitle,
  OracleFullProfile,
} from '../../components/oracle-full-profile';

export const OracleDialog = ({
  provider,
  dataSourceSpecId,
  open,
  onChange,
  parentProvider,
}: {
  dataSourceSpecId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any TODO: fix me
  provider: any;
  open: boolean;
  onChange?: (isOpen: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any TODO: fix me
  parentProvider?: any;
}) => {
  // If this is a successor market, the parent market data will only have been passed
  // in if it differs from the current data. We'll pass this on to the title component
  // to show a change, but the full profile showing changes is unwieldy - it's enough
  // to know from the title that the oracle has changed.
  return (
    <Dialog
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
      />
    </Dialog>
  );
};
