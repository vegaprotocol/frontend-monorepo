import { Button, Intent } from '@vegaprotocol/ui-toolkit';

import { Frame } from '../../frame';
import { Tick } from '../../icons/tick';
import locators from '../../locators';
import { ConnectionHeader } from './connection-header';

export const ConnectionDetails = ({
  handleDecision,
  hostname,
}: {
  handleDecision: (decision: boolean) => void;
  hostname: string;
}) => {
  return (
    <div className="py-3 px-5" data-testid={locators.connectionModalApprove}>
      <ConnectionHeader hostname={hostname} title="Connect to dapp" />
      <Frame>
        <p
          className="text-surface-0-fg-muted mb-3"
          data-testid={locators.connectionModalAccessListTitle}
        >
          Allow this site to:
        </p>
        <ul className="list-none">
          <li className="flex">
            <div>
              <Tick size={12} className="mr-2 text-vega-green-550" />
            </div>
            <p
              data-testid={locators.connectionModalAccessListAccess}
              className="text-light-200"
            >
              See all of your wallet’s public keys
            </p>
          </li>
          <li className="flex">
            <div>
              <Tick size={12} className="mr-2 text-vega-green-550" />
            </div>
            <p
              data-testid={locators.connectionModalAccessListAccess}
              className="text-light-200"
            >
              Send transaction requests for you to sign
            </p>
          </li>
        </ul>
      </Frame>
      <div className="grid grid-cols-[1fr_1fr] justify-between gap-4 mt-5">
        <Button
          data-testid={locators.connectionModalDenyButton}
          onClick={() => handleDecision(false)}
        >
          Deny
        </Button>
        <Button
          data-testid={locators.connectionModalApproveButton}
          intent={Intent.Primary}
          onClick={() => handleDecision(true)}
        >
          Connect
        </Button>
      </div>
    </div>
  );
};
