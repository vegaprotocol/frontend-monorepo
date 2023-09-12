import * as AccordionPrimitive from '@radix-ui/react-accordion';
import classNames from 'classnames';
import type { VegaIconProps } from '../icon';
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

export const AccordionPanel = ({
  trigger,
  children,
  itemId,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  itemId: string;
}) => {
  return (
    <AccordionPrimitive.Item value={itemId}>
      <AccordionPrimitive.Header>{trigger}</AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        className="py-3 text-sm"
        data-testid="accordion-content"
      >
        {children}
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
};

export const AccordionItem = ({
  title,
  content,
  itemId,
}: AccordionPanelProps) => {
  const triggerClassNames = classNames(
    'w-full py-2',
    'flex items-center justify-between gap-2 border-b border-vega-light-200 dark:border-vega-dark-200 text-sm',
    'group'
  );
  return (
    <AccordionPrimitive.Item value={itemId}>
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger
          data-testid="accordion-toggle"
          className={triggerClassNames}
        >
          <span data-testid="accordion-title" className="flex-1 text-left">
            {title}
          </span>
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

export const AccordionChevron = ({
  size = 16,
}: Pick<VegaIconProps, 'size'>) => {
  return (
    <span
      className={classNames(
        'flex transform transition ease-in-out duration-300',
        'group-data-[state=open]:rotate-180'
      )}
    >
      <VegaIcon name={VegaIconNames.CHEVRON_DOWN} aria-hidden size={size} />
    </span>
  );
};
