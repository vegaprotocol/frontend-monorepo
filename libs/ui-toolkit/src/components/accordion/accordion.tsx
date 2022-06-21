import React from 'react';
import * as AccordionRadix from '@radix-ui/react-accordion';
import { keyframes, styled } from '@stitches/react';
import ChevronDownIcon from './chevron-down';

export interface AccordionProp {
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  panels: AccordionProp[];
}

export const Accordion = ({ panels }: AccordionProps) => {
  const AccordionChevron = styled(ChevronDownIcon, {
    transition: 'transform 300ms',
    '[data-state=open] &': { transform: 'rotate(180deg)' },
  });

  const open = keyframes({
    from: { height: 0 },
    to: { height: 'var(--radix-accordion-content-height)' },
  });

  const close = keyframes({
    from: { height: 'var(--radix-accordion-content-height)' },
    to: { height: 0 },
  });

  const AccordionHeader = styled(AccordionRadix.Header, {
    margin: 0,
  });

  const AccordionContent = styled(AccordionRadix.Content, {
    overflow: 'hidden',
    '&[data-state="open"]': { animation: `${open} 300ms ease-out forwards` },
    '&[data-state="closed"]': { animation: `${close} 300ms ease-out forwards` },
  });

  return (
    <AccordionRadix.Root type="multiple" className="flex flex-col">
      {panels.map(({ title, content }, i) => (
        <AccordionRadix.Item value={`item-${i}`} key={`item-${i}`}>
          <AccordionHeader>
            <AccordionRadix.Trigger
              data-testid="accordion-toggle"
              className="w-full py-2 box-border appearance-none cursor-pointer focus:outline-none flex items-center justify-between border-b border-muted"
            >
              <p
                className="inline-block text-footnote font-bold text-h6 text-black dark:text-white pt-5"
                data-testid="accordion-title"
              >
                {title}
              </p>
              <AccordionChevron aria-hidden />
            </AccordionRadix.Trigger>
          </AccordionHeader>
          <AccordionContent
            data-testid="accordion-content-ref"
            className="overflow-auto transition-max-height duration-300 ease-in-out"
          >
            <div className="pb-5" data-testid="accordion-content">
              {content}
            </div>
          </AccordionContent>
        </AccordionRadix.Item>
      ))}
    </AccordionRadix.Root>
  );
};
