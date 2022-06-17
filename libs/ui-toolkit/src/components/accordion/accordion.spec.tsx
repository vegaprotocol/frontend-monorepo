import { fireEvent, render, screen } from '@testing-library/react';

import { AccordionPanel } from './accordion';

describe('Accordion', () => {
  it('should render successfully', () => {
    render(
      <AccordionPanel
        title={'Lorem ipsum title'}
        content={'Lorem ipsum content'}
      />
    );
    expect(screen.queryByTestId('accordion-title')).toHaveTextContent(
      'Lorem ipsum title'
    );
  });

  it('should toggle and open expansion panel', () => {
    render(
      <AccordionPanel
        title={'Lorem ipsum title'}
        content={'Lorem ipsum content'}
      />
    );
    fireEvent.click(screen.getByTestId('accordion-toggle'));
    expect(screen.queryByTestId('accordion-title')).toHaveTextContent(
      'Lorem ipsum title'
    );
    expect(screen.getByTestId('accordion-content')).toHaveTextContent(
      'Lorem ipsum content'
    );
  });
});
