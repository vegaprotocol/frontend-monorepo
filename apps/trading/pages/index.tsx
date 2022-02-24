import { EtherscanLink } from '@vegaprotocol/ui-toolkit';
import { Callout } from '@vegaprotocol/ui-toolkit';
import { ReactHelpers } from '@vegaprotocol/react-helpers';

export function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.scss file.
   */
  return (
    <div>
      <Callout title="Hello there" headingLevel={1}>
        Welcome trading 👋
      </Callout>
      <EtherscanLink chainId={null} address="address" />
      <ReactHelpers />
    </div>
  );
}

export default Index;
