import type { ButtonHTMLAttributes } from 'react';
import { Button } from '@vegaprotocol/ui-toolkit';

export const StatefulButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
) => {
  const classProp = props.className || '';
  return (
    <Button
      {...props}
      className={`flex justify-center items-center gap-12 disabled:cursor-default ${classProp}`}
    />
  );
};
