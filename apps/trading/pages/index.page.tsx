import { Button, Callout, Intent } from '@vegaprotocol/ui-toolkit';

export function Index() {
  return (
    <div className="m-24">
      <div className="mb-24">
        <Callout
          intent={Intent.Help}
          title="Welcome to Vega Trading App"
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
      </div>
    </div>
  );
}

Index.getInitialProps = () => ({
  page: 'home',
});

export default Index;
