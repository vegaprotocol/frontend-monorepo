import { render } from '@testing-library/react';

import { Nav } from './nav';

describe('Nav', () => {
  it('should render title, title content, icon and children', () => {
    const { baseElement } = render(
      <Nav
        navbarTheme="dark"
        icon={<div data-testid="icon" />}
        titleContent={<div data-testid="title-content" />}
        title={'Some title'}
      >
        <div data-testid="link"></div>
      </Nav>
    );
    expect(baseElement).toBeTruthy();
  });
});
