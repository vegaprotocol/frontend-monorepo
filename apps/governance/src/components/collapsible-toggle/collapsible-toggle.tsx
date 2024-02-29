import classnames from 'classnames';
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import type { Dispatch, SetStateAction, ReactNode } from 'react';

interface CollapsibleToggleProps {
  toggleState: boolean;
  setToggleState: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
  dataTestId?: string;
}

export const CollapsibleToggle = ({
  toggleState,
  setToggleState,
  dataTestId,
  children,
}: CollapsibleToggleProps) => {
  const classes = classnames('transition-transform ease-in-out duration-300', {
    'rotate-180': toggleState,
  });

  return (
    <button
      onClick={() => setToggleState(!toggleState)}
      data-testid={dataTestId}
    >
      <div className="flex items-baseline gap-3">
        {children}
        <div className={classes} data-testid="toggle-icon-wrapper">
          <VegaIcon name={VegaIconNames.CHEVRON_DOWN} size={20} />
        </div>
      </div>
    </button>
  );
};
