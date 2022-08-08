import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import AccordionChevron from './chevron-down';
import classNames from 'classnames';

export interface AccordionItemProps {
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  panels: AccordionItemProps[];
}

export const Accordion = ({ panels }: AccordionProps) => {
  const triggerClassNames = classNames(
    'w-full py-2 box-border',
    'appearance-none cursor-pointer focus:outline-none',
    'flex items-center justify-between border-b border-muted',
    'text-left text-black dark:text-white'
  );

  return (
    <AccordionPrimitive.Root type="multiple" className="flex flex-col">
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
              <AccordionChevron aria-hidden />
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
