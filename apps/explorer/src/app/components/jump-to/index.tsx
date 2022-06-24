import type { HTMLInputTypeAttribute, SyntheticEvent } from 'react';
import { Input, Button } from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/react-helpers';

interface JumpToProps {
  label: string;
  placeholder: string;
  inputId: string;
  inputType: HTMLInputTypeAttribute;
  inputName: string;
  submitHandler: (arg0: SyntheticEvent) => void;
}

export const JumpTo = ({
  label,
  placeholder,
  inputId,
  inputType,
  inputName,
  submitHandler,
}: JumpToProps) => {
  return (
    <form onSubmit={submitHandler}>
      <label
        htmlFor={inputId}
        className="block uppercase text-h5 font-bold mb-4"
      >
        {label}
      </label>
      <div className="flex">
        <Input
          data-testid={inputId}
          id={inputId}
          type={inputType}
          name={inputName}
          placeholder={placeholder}
          className="max-w-[200px]"
        />
        <Button
          data-testid="go-submit"
          variant="secondary"
          boxShadow={false}
          type="submit"
        >
          {t('Go')}
        </Button>
      </div>
    </form>
  );
};
