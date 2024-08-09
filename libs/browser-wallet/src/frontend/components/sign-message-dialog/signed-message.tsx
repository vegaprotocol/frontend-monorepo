import { Button, Intent } from '@vegaprotocol/ui-toolkit';

import { CodeWindow } from '../code-window';

export const locators = {
  signedMessageDoneButton: 'signed-message-done-button',
  signedMessageHeader: 'signed-message-header',
};

export const SignedMessage = ({
  onClick,
  message,
}: {
  onClick: () => void;
  message: string;
}) => {
  return (
    <div className="p-2 text-center">
      <h1
        data-testid={locators.signedMessageHeader}
        className="text-xl text-white mb-2"
      >
        Your Signed Message
      </h1>
      <CodeWindow text={message} content={message} />
      <Button
        data-testid={locators.signedMessageDoneButton}
        className="mt-4"
        intent={Intent.Secondary}
        fill={true}
        onClick={onClick}
      >
        Done
      </Button>
    </div>
  );
};
