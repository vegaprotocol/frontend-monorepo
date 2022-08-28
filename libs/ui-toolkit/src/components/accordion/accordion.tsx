import React, { useState } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import classNames from 'classnames';
import { Icon } from '../icon';

export interface AccordionItemProps {
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  panels: AccordionItemProps[];
}

export const Accordion = ({ panels }: AccordionProps) => {
  const [values, setValues] = useState<string[]>([]);
  const triggerClassNames = classNames(
    'w-full py-2',
    'flex items-center justify-between border-b border-neutral-500'
  );

  return (
    <AccordionPrimitive.Root
      type="multiple"
      value={values}
      onValueChange={setValues}
    >
      {panels.map(({ title, content }, i) => (
        <AccordionPrimitive.Item value={`item-${i + 1}`} key={`item-${i + 1}`}>
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger
              data-testid="accordion-toggle"
              className={triggerClassNames}
            >
              <span data-testid="accordion-title">{title}</span>
              <AccordionChevron
                active={values.includes(`item-${i + 1}`)}
                aria-hidden
              />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content data-testid="accordion-content-ref">
            <div className="py-4" data-testid="accordion-content">
              {content}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
};

export const AccordionChevron = ({ active }: { active: boolean }) => {
  return (
    <Icon
      name="chevron-down"
      className={classNames('transition ease-in-out duration-300', {
        'transform rotate-180': active,
      })}
      aria-hidden
    />
  );
};
