import { render, screen } from '@testing-library/react';

import { locators } from '../../../data-table';
import { Amendment } from '.';

describe('Amend', () => {
  it('should render nothing if the order has pegged offset set', () => {
    const { container } = render(
      <Amendment transaction={{ orderAmendment: { pegged_offset: {} } }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
  it('should render nothing if the order has pegged reference set', () => {
    const { container } = render(
      <Amendment transaction={{ orderAmendment: { pegged_reference: {} } }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
  it('should render badges and table data', () => {
    // 1116-ORDA-003 I can see any relevant order badges
    render(
      <Amendment
        transaction={{ orderAmendment: { reference: 'foo', postOnly: true } }}
      />
    );
    const [referenceRow] = screen.getAllByTestId(locators.dataRow);
    expect(referenceRow).toHaveTextContent('foo');
    expect(screen.getByText('Post only')).toBeVisible();
  });
});
