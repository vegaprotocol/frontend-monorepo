import { cn } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { DropdownArrow } from '../icons/dropdown-arrow';
import locators from '../locators';
import { SubHeader } from '../sub-header';

export const CollapsiblePanel = ({
  initiallyOpen = false,
  title,
  panelContent,
}: {
  initiallyOpen?: boolean;
  title: string;
  panelContent: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  return (
    <div data-testid={locators.collapsiblePanel}>
      <button
        className={cn('flex justify-between w-full', {
          'mb-4': isOpen,
        })}
        onClick={() => setIsOpen(!isOpen)}
        data-testid={locators.collapsiblePanelButton}
      >
        <SubHeader content={title} />
        <DropdownArrow
          className={cn('w-3 ml-3 mb-1', {
            'rotate-180': isOpen,
          })}
        />
      </button>
      <div
        data-testid={locators.collapsiblePanelContent}
        className={isOpen ? '' : 'hidden'}
      >
        {panelContent}
      </div>
    </div>
  );
};
