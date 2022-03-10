import { Callout, Button } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/react-helpers';

export function Index() {
  const { keypair, keypairs, selectPublicKey, sendTx } = useVegaWallet();

  return (
    <div className="m-24">
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
      {keypairs?.length ? (
        <select
          name="change-key"
          className="w-full px-8 py-2 border-black border"
          value={keypair ? keypair.pub : 'none'}
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
      ) : null}
    </div>
  );
}

export default Index;
