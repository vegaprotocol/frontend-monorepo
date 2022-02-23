import { Callout, Button } from '@vegaprotocol/ui-toolkit';
import { ReactHelpers, useVegaWallet } from '@vegaprotocol/react-helpers';
import { useEffect } from 'react';
import { rest } from '../lib/connectors';
import { LocalStorage } from '@vegaprotocol/storage';

export function Index() {
  useEagerConnect();
  const { publicKey, publicKeys, selectPublicKey } = useVegaWallet();
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
          onChange={(e) => selectPublicKey(e.target.value)}
        >
          {publicKeys.map((pk) => (
            <option key={pk.pub} value={pk.pub}>
              {pk.name} ({pk.pub})
            </option>
          ))}
        </select>
      )}
      <h2>Public keys</h2>
      <pre>{JSON.stringify(publicKeys, null, 2)}</pre>
    </div>
  );
}

export default Index;

function useEagerConnect() {
  const { connect } = useVegaWallet();

  useEffect(() => {
    // Might be safer to store connector name and eager connect using that
    if (LocalStorage.getItem('vega_wallet_token')) {
      connect(rest);
    }
  }, [connect]);
}
