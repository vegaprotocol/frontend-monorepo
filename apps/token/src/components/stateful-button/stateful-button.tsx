import './stateful-button.scss';

import type { ButtonHTMLAttributes } from 'react';
import { Button } from '@vegaprotocol/ui-toolkit';

export const StatefulButton = (
  props: ButtonHTMLAttributes<HTMLButtonElement>
) => {
  const classProp = props.className || '';
  return <Button {...props} className={`stateful-button fill ${classProp}`} />;
};
