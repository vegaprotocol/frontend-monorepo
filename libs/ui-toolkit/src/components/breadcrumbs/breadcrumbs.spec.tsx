import { render } from '@testing-library/react';
import { Link, MemoryRouter } from 'react-router-dom';
import { Breadcrumbs } from './breadcrumbs';

describe('Breadcrumbs', () => {
  it('does not display breadcrumbs if no elements are provided', () => {
    const { queryAllByTestId } = render(
      <Breadcrumbs elements={[]} data-testid="crumbs" />
    );

    expect(queryAllByTestId('crumbs')).toHaveLength(0);
  });

  it('does display given elements', () => {
    const { getByTestId, container } = render(
      <MemoryRouter>
        <Breadcrumbs
          elements={['1', <Link to="/two">2</Link>, '3']}
          data-testid="crumbs"
        />
      </MemoryRouter>
    );

    const crumbs = Array.from(
      container.querySelectorAll('[data-testid="crumbs"] li')
    );

    expect(getByTestId('crumbs')).toBeInTheDocument();
    expect(crumbs).toHaveLength(3);
    expect(crumbs[0].textContent).toBe('1');
    expect(crumbs[1].textContent).toBe('2');
    expect(crumbs[2].textContent).toBe('3');
  });
});
