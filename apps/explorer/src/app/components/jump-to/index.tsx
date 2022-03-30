import type { HTMLInputTypeAttribute, SyntheticEvent } from 'react';
import { Input, Button } from '@vegaprotocol/ui-toolkit';

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
          id={inputId}
          type={inputType}
          name={inputName}
          placeholder={placeholder}
          className="max-w-[200px]"
        />
        <Button variant="secondary" type="submit">
          Go
        </Button>
      </div>
    </form>
  );
};
