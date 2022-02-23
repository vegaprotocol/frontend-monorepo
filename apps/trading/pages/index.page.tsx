import { Callout, Button } from '@vegaprotocol/ui-toolkit';
import { rest } from '../lib/connectors';
import { useVegaWallet, VegaKeyExtended } from '@vegaprotocol/react-helpers';
import { useEffect, useMemo, useState } from 'react';
import { Connectors, rest } from '../lib/connectors';
import { LocalStorage } from '@vegaprotocol/storage';

export function Index() {
  // Get keys from vega wallet immediately
  useEagerConnect();

  const { publicKeys } = useVegaWallet();
  const { publicKey, onSelect } = useCurrentVegaKey();

  return (
    <div className="m-24 ">
      <Callout
        intent="help"
        title="This is what this thing does"
        iconName="endorsed"
        headingLevel={1}
      >
        <div className="flex flex-col">
          <div>With a longer explaination</div>
          <Button className="block mt-8" variant="secondary">
            Action
          </Button>
        </div>
      </Callout>
      <h1>Vega wallet</h1>
      {publicKey && <p>Current: {publicKey.pub}</p>}
      {publicKeys?.length && (
        <select
          name="change-key"
          value={publicKey?.pub}
          onChange={(e) => onSelect(e.target.value)}
        >
          {publicKeys.map((pk) => (
            <option key={pk.pub} value={pk.pub}>
              {pk.name} ({pk.pub})
            </option>
          ))}
        </select>
      )}
      <hr />
      <h2>Public keys</h2>
      <pre>{JSON.stringify(publicKeys, null, 2)}</pre>
    </div>
  );
}

export default Index;

function useEagerConnect() {
  const { connect } = useVegaWallet();

  useEffect(() => {
    const cfg = LocalStorage.getItem('vega_wallet');
    const cfgObj = JSON.parse(cfg);

    // No stored config, user has never connected or manually cleared storage
    if (!cfgObj || !cfgObj.connector) {
      return;
    }

    const connector = Connectors[cfgObj.connector];

    // Developer hasn't provided this connector
    if (!connector) {
      throw new Error(`Connector ${cfgObj?.connector} not configured`);
    }

    connect(Connectors[cfgObj.connector]);
  }, [connect]);
}

function useCurrentVegaKey(): {
  publicKey: VegaKeyExtended | null;
  onSelect: (pk: string) => void;
} {
  const { publicKeys } = useVegaWallet();
  const [pk, setPk] = useState<string | null>(() =>
    LocalStorage.getItem('vega_selected_publickey')
  );

  const publicKey = useMemo(() => {
    if (!publicKeys?.length) return null;

    const found = publicKeys.find((x) => x.pub === pk);

    if (found) {
      return found;
    }

    return null;
  }, [pk, publicKeys]);

  // on public key change set to localStorage
  useEffect(() => {
    LocalStorage.setItem('vega_selected_publickey', pk);
  }, [pk]);

  return {
    publicKey,
    onSelect: setPk,
  };
}
