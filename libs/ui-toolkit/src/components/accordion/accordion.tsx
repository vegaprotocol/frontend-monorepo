import React, { useState } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import classNames from 'classnames';
import { VegaIcon, VegaIconNames } from '../icon';

export interface AccordionItemProps {
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionPanelProps extends AccordionItemProps {
  itemId: string;
  active: boolean;
}

export interface AccordionProps {
  panels?: AccordionItemProps[];
  children?: React.ReactNode;
}

export const Accordion = ({ panels, children }: AccordionProps) => {
  const [values, setValues] = useState<string[]>([]);

  return (
    <AccordionPrimitive.Root
      type="multiple"
      value={values}
      onValueChange={setValues}
    >
      {panels?.map(({ title, content }, i) => (
        <AccordionItem
          key={`item-${i + 1}`}
          itemId={`item-${i + 1}`}
          title={title}
          content={content}
          active={values.includes(`item-${i + 1}`)}
        />
      ))}
      {children}
    </AccordionPrimitive.Root>
  );
};

export const AccordionItem = ({
  title,
  content,
  itemId,
  active,
}: AccordionPanelProps) => {
  const triggerClassNames = classNames(
    'w-full py-2',
    'flex items-center justify-between border-b border-neutral-500 text-sm'
  );
  return (
    <AccordionPrimitive.Item value={itemId}>
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger
          data-testid="accordion-toggle"
          className={triggerClassNames}
        >
          <span data-testid="accordion-title">{title}</span>
          <AccordionChevron active={active} aria-hidden />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content data-testid="accordion-content-ref">
        <div className="py-4 text-sm" data-testid="accordion-content">
          {content}
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
};

export const AccordionChevron = ({ active }: { active: boolean }) => {
  return (
    <span
      className={classNames('transition ease-in-out duration-300', {
        'transform rotate-180': active,
      })}
    >
      <VegaIcon name={VegaIconNames.CHEVRON_DOWN} aria-hidden />
    </span>
  );
};
