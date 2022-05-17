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

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
    };
  },
}));

describe('Index', () => {
  it('should render successfully', async () => {
    await act(async () => {
      const { baseElement } = render(
        <MockedProvider>
          <Index />
        </MockedProvider>
      );
      expect(baseElement).toBeTruthy();
    });
  });
});
