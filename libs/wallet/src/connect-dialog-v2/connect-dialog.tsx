import { Dialog, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { useConfig, useConnect, useWallet } from '../wallet';
import { type Status } from '../types';

export const ConnectDialog = ({
  open,
  onChange,
  onConnect,
}: {
  open: boolean;
  onChange: (open: boolean) => void;
  onConnect: () => void;
}) => {
  const status = useWallet((store) => store.status);
  const error = useWallet((store) => store.error);

  return (
    <Dialog open={open} size="small" onChange={onChange}>
      {status === 'disconnected' ? (
        <ConnectionOptions onConnect={onConnect} error={error} />
      ) : (
        <ConnectionStatus status={status} />
      )}
    </Dialog>
  );
};

const ConnectionOptions = ({
  error,
  onConnect,
}: {
  error: string | undefined;
  onConnect: () => void;
}) => {
  const config = useConfig();
  const { connect, connectors } = useConnect();

  if (error && !error.includes('the user rejected')) {
    return (
      <>
        <p className="text-danger first-letter:uppercase">{error}</p>
        <button
          className="underline"
          onClick={() =>
            config.setStoreState({ status: 'disconnected', error: undefined })
          }
        >
          Try again
        </button>
      </>
    );
  }

  return (
    <ul>
      {connectors.map((c) => {
        return (
          <li key={c.id}>
            <button
              onClick={async () => {
                await connect(c.id);
                onConnect();
              }}
            >
              {c.id}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

const ConnectionStatus = ({ status }: { status: Status }) => {
  if (status === 'connecting') {
    return (
      <>
        <h3 className="text-lg">Connecting...</h3>
        <p className="text-secondary">Confirm connection in your wallet</p>
      </>
    );
  }
  if (status === 'connected') {
    return (
      <div className="flex items-center gap-3">
        <VegaIcon name={VegaIconNames.TICK} className="text-vega-green" />
        <h3 className="text-lg">Connected</h3>
      </div>
    );
  }

  return null;
};
