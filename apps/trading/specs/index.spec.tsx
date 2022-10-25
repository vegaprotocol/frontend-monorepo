import React from 'react';
import { act, render } from '@testing-library/react';
import Index from '../pages/index.page';
import { MockedProvider } from '@apollo/react-testing';

jest.mock('@vegaprotocol/ui-toolkit', () => {
  const original = jest.requireActual('@vegaprotocol/ui-toolkit');
  return {
    ...original,
    AgGridDynamic: () => <div>AgGrid</div>,
  };
});

describe('Index', () => {
  it('should render successfully', async () => {
    act(() => {
      const { baseElement } = render(
        <MockedProvider>
          <Index />
        </MockedProvider>
      );
      expect(baseElement).toBeTruthy();
    });
  });
});
