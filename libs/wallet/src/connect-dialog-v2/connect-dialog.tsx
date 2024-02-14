import {
  Dialog,
  Tooltip,
  VLogo,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useConfig, useConnect, useWallet } from '../wallet';
import { type Status } from '../types';
import { useT } from '../use-t';

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
    <ul className="flex flex-col gap-2">
      {connectors.map((c) => {
        return (
          <ConnectionOption
            key={c.id}
            id={c.id as any}
            onClick={async () => {
              const res = await connect(c.id);
              if (res.success) {
                onConnect();
              }
            }}
          />
        );
      })}
    </ul>
  );
};

const ConnectionOption = ({
  id,
  onClick,
}: {
  id: 'injected' | 'jsonRpc' | 'snap' | 'readOnly';
  onClick: () => void;
}) => {
  const t = useT();
  return (
    <li>
      <Tooltip
        description={t(`connector-${id}-desc`)}
        align="center"
        side="right"
        sideOffset={10}
      >
        <button
          className="flex gap-2 items-center capitalize"
          onClick={onClick}
        >
          <span className="flex items-center justify-center w-8 h-8 rounded bg-vega-cdark-600 dark:bg-vega-clight-600 text-vega-clight-800 dark:text-vega-cdark-800">
            <ConnectorIcon id={id} />
          </span>
          {t(`connector-${id}-title`)}
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

const ConnectorIcon = ({
  id,
}: {
  id: 'injected' | 'jsonRpc' | 'snap' | 'readOnly';
}) => {
  switch (id) {
    case 'injected': {
      return <VLogo className="w-4 h-4" />;
    }
    case 'jsonRpc': {
      return (
        <span className="text-xs">
          <span className="relative -top-0.5">{'>_'}</span>
        </span>
      );
    }
    case 'snap': {
      return <VegaIcon name={VegaIconNames.METAMASK} size={24} />;
    }
    case 'readOnly': {
      return <VegaIcon name={VegaIconNames.EYE} size={20} />;
    }
  }
};
