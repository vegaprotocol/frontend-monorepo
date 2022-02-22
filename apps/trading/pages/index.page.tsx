import { Callout, Button } from '@vegaprotocol/ui-toolkit';

export function Index() {
  const vegaWallet = useVegaWallet();
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
      <pre>{JSON.stringify(vegaWallet, null, 2)}</pre>
    </div>
  );
}

export default Index;
