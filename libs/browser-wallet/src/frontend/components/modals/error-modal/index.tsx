import { Button } from '@vegaprotocol/ui-toolkit';

import { CodeWindow } from '../../code-window';
import { Header } from '../../header';
import { ErrorIcon } from '../../icons/error';
import { Splash } from '../../splash';

export const locators = {
  errorModal: 'error-modal',
  errorModalClose: 'error-modal-close',
};

export const ErrorModal = ({
  error,
  onClose,
}: {
  error: Error | null;
  onClose: () => void;
}) => {
  return (
    <Splash data-testid={locators.errorModal}>
      <section className="h-full text-center flex flex-col justify-center px-5">
        <div className="text-center mx-auto">
          <ErrorIcon />
        </div>
        <Header content="Something's gone wrong" />
        <div className="my-8 text-xs">
          {error ? (
            <CodeWindow
              content={error.stack}
              text={JSON.stringify(error.stack, null, 2)}
            />
          ) : (
            <CodeWindow
              content={'An unknown error occurred'}
              text={'An unknown error occurred'}
            />
          )}
        </div>
        <Button data-testid={locators.errorModalClose} onClick={onClose}>
          Close
        </Button>
      </section>
    </Splash>
  );
};
