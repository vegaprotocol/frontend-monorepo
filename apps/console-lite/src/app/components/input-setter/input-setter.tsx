import React, { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { Input } from '@vegaprotocol/ui-toolkit';
import type { InputProps } from '@vegaprotocol/ui-toolkit';

interface InputSetterProps {
  buttonLabel?: string;
  isInputVisible?: boolean;
  children?: ReactNode;
}

export const InputSetter = ({
  buttonLabel = t('set'),
  isInputVisible = false,
  children,
  ...props
}: InputSetterProps & InputProps) => {
  const [isInputToggled, setIsInputToggled] = useState(isInputVisible);

  const toggleInput = useCallback(() => {
    setIsInputToggled(!isInputToggled);
  }, [isInputToggled]);

  const onInputEnter = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.stopPropagation();
        toggleInput();
      }
    },
    [toggleInput]
  );

  return isInputToggled ? (
    <div className="flex items-center">
      <Input {...props} onKeyDown={onInputEnter} />
      <button
        type="button"
        className="no-underline hover:underline text-blue ml-2"
        onClick={toggleInput}
      >
        {buttonLabel}
      </button>
    </div>
  ) : (
    <button
      type="button"
      className="no-underline hover:underline text-blue py-1.5"
      onClick={toggleInput}
    >
      {children || props.value}
    </button>
  );
};
