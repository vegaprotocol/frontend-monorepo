import classnames from 'classnames';
import { Icon } from '@vegaprotocol/ui-toolkit';
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
  const classes = classnames(
    'mb-4 transition-transform ease-in-out duration-300',
    {
      'rotate-180': toggleState,
    }
  );

  return (
    <button
      onClick={() => setToggleState(!toggleState)}
      data-testid={dataTestId}
    >
      <div className="flex items-center gap-3">
        {children}
        <div className={classes} data-testid="toggle-icon-wrapper">
          <Icon name="chevron-down" size={8} />
        </div>
      </div>
    </button>
  );
};
