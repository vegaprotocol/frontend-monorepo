import { Callout, Button } from '@vegaprotocol/ui-toolkit';
import { rest } from '../lib/connectors';
import { useVegaWallet, VegaKeyExtended } from '@vegaprotocol/react-helpers';
import { useEffect, useMemo, useState } from 'react';
import { Connectors, rest } from '../lib/connectors';
import { LocalStorage } from '@vegaprotocol/storage';

export function Index() {
  const { keypair, keypairs, selectPublicKey } = useVegaWallet();

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
      {keypair && <p>Current: {keypair.pub}</p>}
      {keypairs?.length && (
        <select
          name="change-key"
          defaultValue="none"
          onChange={(e) => selectPublicKey(e.target.value)}
        >
          <option value="none" disabled={true}>
            Please select
          </option>
          {keypairs.map((pk) => (
            <option key={pk.pub} value={pk.pub}>
              {pk.name} ({pk.pub})
            </option>
          ))}
        </select>
      )}
      <hr />
      <h2>Public keys</h2>
      <pre>{JSON.stringify(keypairs, null, 2)}</pre>
    </div>
  );
}

export default Index;
