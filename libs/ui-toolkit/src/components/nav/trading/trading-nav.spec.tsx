import { fireEvent, render, screen } from '@testing-library/react';
import { Navbar } from './trading-nav';

describe('Trading nav', () => {
  it('renders menu items successfully', () => {
    render(
      <Navbar
        navItems={[
          { name: 'Item 1', path: '/foo', isActive: false },
          { name: 'Item 2', path: '/bar', isActive: false },
          { name: 'Item 3', path: '/baz', isActive: false },
        ]}
      />
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders assistive menu label if label and ID provided', () => {
    const label = 'test-label';
    render(<Navbar menuName={label} menuId={'test'} />);
    expect(screen.getByTestId('menu-label')).toHaveTextContent(label);
  });

  it('renders home link Vega logo if desired', () => {
    render(<Navbar showHomeLogo={true} />);
    expect(screen.getByTestId('home-logo')).toBeInTheDocument();
  });

  it('renders active nav item if provided', () => {
    render(
      <Navbar
        navItems={[
          { name: 'Item 1', path: '/foo', isActive: false },
          { name: 'Item 2', path: '/bar', isActive: true },
        ]}
      />
    );
    expect(screen.getByText('Item 1')).not.toHaveClass('active');
    expect(screen.getByText('Item 2')).toHaveClass('active');
  });

  it('fires callback on click if provided', () => {
    const callback = jest.fn();

    render(
      <Navbar
        navItems={[
          { name: 'Item 1', path: '/foo', isActive: false, onClick: callback },
        ]}
      />
    );

    const navItem = screen.getByText('Item 1');
    fireEvent.click(navItem);
    expect(callback.mock.calls.length).toEqual(1);
  });
});
