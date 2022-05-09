import React from 'react';
import { render } from '@testing-library/react';
import Index from '../pages/index.page';

jest.mock('@vegaprotocol/ui-toolkit', () => {
  const original = jest.requireActual('@vegaprotocol/ui-toolkit');
  return {
    ...original,
    AgGridDynamic: () => <div>AgGrid</div>,
  };
});

describe('Index', () => {
  it('should render successfully', () => {
    render(<Index />);
    expect(true).toBeTruthy();
  });
});
