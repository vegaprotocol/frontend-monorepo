import { styled } from '@stitches/react';
import { ChevronDownIcon } from '@radix-ui/react-icons';

const AccordionChevron = styled(ChevronDownIcon, {
  transition: 'transform 300ms',
  '[data-state=open] &': { transform: 'rotate(180deg)' },
  width: 20,
  height: 20,
});

export default AccordionChevron;
