import * as AccordionPrimitive from '@radix-ui/react-accordion';
import classNames from 'classnames';
import { VegaIcon, VegaIconNames } from '../icon';

export interface AccordionItemProps {
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionPanelProps extends AccordionItemProps {
  itemId: string;
}

export interface AccordionProps {
  panels?: AccordionItemProps[];
  children?: React.ReactNode;
}

export const Accordion = ({ panels, children }: AccordionProps) => {
  return (
    <AccordionPrimitive.Root type="multiple">
      {children}
    </AccordionPrimitive.Root>
  );
};

export const AccordionItem = ({
  title,
  content,
  itemId,
}: AccordionPanelProps) => {
  const triggerClassNames = classNames(
    'w-full py-2',
    'flex items-center justify-between border-b border-vega-light-200 dark:border-vega-dark-200 text-sm',
    'group'
  );
  return (
    <AccordionPrimitive.Item value={itemId}>
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger
          data-testid="accordion-toggle"
          className={triggerClassNames}
        >
          <span data-testid="accordion-title">{title}</span>
          <AccordionChevron aria-hidden />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        className="py-3 text-sm"
        data-testid="accordion-content"
      >
        {content}
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
};

export const AccordionChevron = () => {
  return (
    <span
      className={classNames(
        'transform transition ease-in-out duration-300',
        'group-data-[state=open]:rotate-180'
      )}
    >
      <VegaIcon name={VegaIconNames.CHEVRON_DOWN} aria-hidden />
    </span>
  );
};
