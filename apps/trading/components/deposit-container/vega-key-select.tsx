import { type ReactNode, useState } from 'react';

/** Switch between two render prop children for input or select */
export const VegaKeySelect = ({
  input,
  select,
  onChange,
}: {
  input: ReactNode;
  select: ReactNode;
  onChange: () => void;
}) => {
  const [isInputVegaKey, setIsInputVegaKey] = useState(false);

  return (
    <>
      {isInputVegaKey ? input : select}
      <button
        type="button"
        onClick={() => {
          setIsInputVegaKey((x) => !x);
          onChange();
        }}
        className="absolute right-0 top-0 pt-0.5 ml-auto text-xs underline underline-offset-4"
      >
        {isInputVegaKey ? 'Select from wallet' : 'Enter manually'}
      </button>
    </>
  );
};
