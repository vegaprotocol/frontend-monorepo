import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { styled } from '@stitches/react';

export interface AccordionProps {
  key?: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export const AccordionPanel = ({ key, title, content }: AccordionProps) => {
  const AccordionChevron = styled(ChevronDown, {
    transition: 'transform 300ms ease',
    '[data-state=open] &': { transform: 'rotate(180deg)' },
  });
  return (
    <Accordion.Root type="multiple" className="flex flex-col">
      <Accordion.Item value={key ?? 'item'}>
        <Accordion.Header>
          <Accordion.Trigger
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
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content
          data-testid="accordion-content-ref"
          className="overflow-auto transition-max-height duration-300 ease-in-out"
        >
          <div className="pb-5" data-testid="accordion-content">
            {content}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};

export const ChevronDown = () => {
  return (
    <svg
      width="20"
      height="20"
      aria-label="chevron icon"
      data-testid="accordion-chevron-icon"
      className={`inline-block fill-black dark:fill-white`}
      viewBox="0 0 20 20"
      fill="fillCurrent"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="17" y="8" width="2" height="2" />
      <rect x="15" y="10" width="2" height="2" />
      <rect x="13" y="12" width="2" height="2" />
      <rect x="11" y="14" width="2" height="2" />
      <rect x="9" y="12" width="2" height="2" />
      <rect x="7" y="10" width="2" height="2" />
      <rect x="5" y="8" width="2" height="2" />
    </svg>
  );
};
