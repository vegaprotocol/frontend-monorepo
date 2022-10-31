import type { ReactNode } from 'react';
import classNames from 'classnames';
import { InputError } from '@vegaprotocol/ui-toolkit';
import { useEffect, useRef, useState } from 'react';

export interface DealTicketErrorMessage {
  message: ReactNode | string;
  isDisabled: boolean;
}

interface Props {
  errorMessage?: DealTicketErrorMessage;
  'data-testid'?: string;
}

export const DealTicketError = ({
  errorMessage,
  'data-testid': dataTestId = 'deal-ticket-error-message',
}: Props) => {
  const [message, setMessage] = useState<DealTicketErrorMessage['message']>('');
  const ts = useRef<null | number>(null);
  useEffect(() => {
    // use set timeout for create a transition effect
    clearTimeout(ts.current as number);
    if (errorMessage?.message) {
      setMessage(errorMessage.message);
    } else {
      ts.current = setTimeout(() => {
        setMessage('');
        ts.current = null;
      }, 300) as unknown as number;
    }
  }, [errorMessage?.message]);

  return (
    <div
      className={classNames(
        '-mt-1 ease-in-out transition-[max-height] max-h-0 overflow-hidden duration-200',
        {
          'max-h-[500px]': errorMessage,
        }
      )}
    >
      <InputError
        intent={errorMessage?.isDisabled ? 'danger' : 'warning'}
        data-testid={dataTestId}
      >
        {message}
      </InputError>
    </div>
  );
};
