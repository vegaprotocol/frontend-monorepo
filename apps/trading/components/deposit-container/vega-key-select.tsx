import { type ReactNode, useState } from 'react';
import { useT } from '../../lib/use-t';

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
  const t = useT();
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
        {isInputVegaKey ? t('Select from wallet') : t('Enter manually')}
      </button>
    </>
  );
};
