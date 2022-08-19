import React, { useState } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import classNames from 'classnames';
import { ChevronDownIcon } from '@radix-ui/react-icons';

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
    'w-full py-2 box-border',
    'appearance-none cursor-pointer focus:outline-none',
    'flex items-center justify-between border-b border-muted',
    'text-left text-black dark:text-white'
  );

  return (
    <AccordionPrimitive.Root
      type="multiple"
      className="flex flex-col"
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
              <p
                className="inline-block text-footnote font-medium text-h6  pt-5"
                data-testid="accordion-title"
              >
                {title}
              </p>
              <AccordionChevron
                active={values.includes(`item-${i + 1}`)}
                aria-hidden
              />
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

export const AccordionChevron = ({ active }: { active: boolean }) => {
  return (
    <ChevronDownIcon
      className={classNames('w-20 h-20 transition ease-in-out duration-300', {
        'transform rotate-180': active,
      })}
      aria-hidden
    />
  );
};
