import React, { useState } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import ChevronDownIcon from './chevron-down';
import classNames from 'classnames';

export interface AccordionItemProps {
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  panels: AccordionItemProps[];
}

export const Accordion = ({ panels }: AccordionProps) => {
  const [value, setValue] = useState<string>('');
  const triggerClassNames = classNames(
    'w-full py-2 box-border',
    'appearance-none cursor-pointer focus:outline-none',
    'flex items-center justify-between border-b border-muted'
  );

  return (
    <AccordionPrimitive.Root
      type="single"
      className="flex flex-col"
      value={value}
      onValueChange={setValue}
      collapsible
    >
      {panels.map(({ title, content }, i) => (
        <AccordionPrimitive.Item value={`item-${i + 1}`} key={`item-${i + 1}`}>
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger
              data-testid="accordion-toggle"
              className={triggerClassNames}
            >
              <p
                className="inline-block text-footnote font-medium text-h6 text-black dark:text-white pt-5"
                data-testid="accordion-title"
              >
                {title}
              </p>
              <ChevronDownIcon active={value === `item-${i + 1}`} aria-hidden />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content
            data-testid="accordion-content-ref"
            className="overflow-auto transition-max-height duration-300 ease-in-out"
          >
            <div className="pb-5" data-testid="accordion-content">
              {content}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
};
