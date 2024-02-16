import {
  Dialog,
  Tooltip,
  VLogo,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { type ConnectorType, type Status } from '@vegaprotocol/wallet';
import { useWallet } from '../../hooks/use-wallet';
import { useConnect } from '../../hooks/use-connect';
import classNames from 'classnames';

export const ConnectDialog = ({
  open,
  onChange,
}: {
  open: boolean;
  onChange: (open: boolean) => void;
}) => {
  const status = useWallet((store) => store.status);
  const error = useWallet((store) => store.error);

  return (
    <Dialog open={open} size="small" onChange={onChange}>
      {status === 'disconnected' ? (
        <ConnectionOptions
          error={error}
          onConnect={() => {
            setTimeout(() => onChange(false), 1000);
          }}
        />
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
  const { connect, connectors } = useConnect();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl">Connect Vega Wallet</h2>
      <ul className="grid grid-cols-2 gap-x-2 gap-y-4">
        {connectors.map((c) => {
          return (
            <ConnectionOption
              key={c.id}
              id={c.id}
              name={c.name}
              description={c.description}
              onClick={async () => {
                const res = await connect(c.id);
                if (res?.success) {
                  onConnect();
                }
              }}
            />
          );
        })}
      </ul>
      {error && !error.includes('the user rejected') && (
        <p className="text-danger text-sm first-letter:uppercase">{error}</p>
      )}
    </div>
  );
};

const ConnectionOption = ({
  id,
  name,
  description,
  onClick,
}: {
  id: ConnectorType;
  name: string;
  description: string;
  onClick: () => void;
}) => {
  return (
    <li>
      <Tooltip
        description={description}
        align="center"
        side="right"
        sideOffset={10}
      >
        <button
          className="flex gap-2 items-center capitalize"
          onClick={onClick}
        >
          <ConnectorIcon id={id} />
          {name}
        </button>
      </Tooltip>
    </li>
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

const ConnectorIcon = ({ id }: { id: ConnectorType }) => {
  const defaultWrapperClasses =
    'flex items-center justify-center w-8 h-8 rounded';
  switch (id) {
    case 'injected': {
      return (
        <span
          className={classNames(
            defaultWrapperClasses,
            'bg-vega-cdark-600 dark:bg-vega-clight-600 text-vega-clight-800 dark:text-vega-cdark-800'
          )}
        >
          <VLogo className="w-4 h-4" />
        </span>
      );
    }
    case 'jsonRpc': {
      return (
        <span
          className={classNames(
            defaultWrapperClasses,
            'bg-vega-cdark-600 dark:bg-vega-clight-600 text-vega-clight-800 dark:text-vega-cdark-800 text-xs'
          )}
        >
          <span className="relative -top-0.5">{'>_'}</span>
        </span>
      );
    }
    case 'snap': {
      return (
        <span className={classNames(defaultWrapperClasses, 'border')}>
          <VegaIcon name={VegaIconNames.METAMASK} size={24} />
        </span>
      );
    }
    case 'readOnly': {
      return (
        <span
          className={classNames(
            defaultWrapperClasses,
            'bg-vega-blue-500 text-vega-clight-800'
          )}
        >
          <VegaIcon name={VegaIconNames.EYE} size={20} />
        </span>
      );
    }
  }

  throw new Error('invalid connector id');
};
