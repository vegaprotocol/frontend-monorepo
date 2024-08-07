import { Button } from '@vegaprotocol/ui-toolkit';

import { HiddenContainer } from '@/components/hidden-container';

export const locators = {
  exportRecoveryPhraseClose: 'export-recovery-phrase-close',
};

export interface ViewRecoveryPhraseProperties {
  recoveryPhrase: string;
  onClose: () => void;
}

export const ViewRecoveryPhrase = ({
  recoveryPhrase,
  onClose,
}: ViewRecoveryPhraseProperties) => {
  return (
    <>
      <HiddenContainer
        wrapContent={true}
        text="Reveal private key"
        hiddenInformation={recoveryPhrase}
      />
      <Button
        data-testid={locators.exportRecoveryPhraseClose}
        className="mt-4"
        fill={true}
        variant="primary"
        onClick={onClose}
      >
        Close
      </Button>
    </>
  );
};
