import React, { useCallback, useState } from 'react';
import { t } from '@vegaprotocol/react-helpers';
import { Input } from '@vegaprotocol/ui-toolkit';
import type { InputProps } from '@vegaprotocol/ui-toolkit';

interface InputSetterProps {
  buttonLabel?: string;
  value: string | number;
  isInputVisible?: boolean;
  onValueChange?: () => string;
}

export const InputSetter = ({
  buttonLabel = t('set'),
  value = '',
  isInputVisible = false,
  onValueChange,
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
      <Input {...props} value={value} onKeyDown={onInputEnter} />
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
      className="no-underline hover:underline text-blue"
      onClick={toggleInput}
    >
      {value}
    </button>
  );
};
