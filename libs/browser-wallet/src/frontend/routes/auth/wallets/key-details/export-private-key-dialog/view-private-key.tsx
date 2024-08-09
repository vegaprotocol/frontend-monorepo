import { Button, Intent } from '@vegaprotocol/ui-toolkit';

import { HiddenContainer } from '@/components/hidden-container';

export const locators = {
  viewPrivateKeyClose: 'view-private-key-close',
};

export interface ViewPrivateKeyProperties {
  onClose: () => void;
  privateKey: string;
}

export const ViewPrivateKey = ({
  privateKey,
  onClose,
}: ViewPrivateKeyProperties) => {
  return (
    <>
      <HiddenContainer
        wrapContent={true}
        text="Reveal private key"
        hiddenInformation={privateKey}
      />
      <Button
        data-testid={locators.viewPrivateKeyClose}
        className="mt-4"
        fill={true}
        intent={Intent.Primary}
        onClick={onClose}
      >
        Close
      </Button>
    </>
  );
};
