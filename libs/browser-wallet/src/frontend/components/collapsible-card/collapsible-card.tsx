import { cn } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { DropdownArrow } from '../icons/dropdown-arrow';

export const locators = {
  collapsibleCard: 'collapsible-card',
  collapsibleCardButton: 'collapsible-card-button',
  collapsibleCardContent: 'collapsible-card-content',
};

export const CollapsibleCard = ({
  initiallyOpen = false,
  title,
  cardContent,
}: {
  initiallyOpen?: boolean;
  title: ReactNode;
  cardContent: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  return (
    <div data-testid={locators.collapsibleCard}>
      <button
        className="p-3 hover:bg-vega-dark-200 flex w-full justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
        data-testid={locators.collapsibleCardButton}
      >
        {title}
        <div>
          <DropdownArrow
            className={cn('w-3 ml-3 mb-1', {
              'rotate-180': isOpen,
            })}
          />
        </div>
      </button>
      <div
        data-testid={locators.collapsibleCardContent}
        className={cn('p-3', { hidden: !isOpen })}
      >
        {cardContent}
      </div>
    </div>
  );
};
