import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import PriceInAsset from './price-in-asset';
import { MockedProvider } from '@apollo/client/testing';

function renderComponent(price: string, decimals: number, symbol: string) {
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <MemoryRouter>
        <PriceInAsset price={price} decimals={decimals} symbol={symbol} />
      </MemoryRouter>
    </MockedProvider>
  );
}
describe('Price in Market component', () => {
  it('Renders the raw price before there is no market data', () => {
    const res = render(renderComponent('100', 8, 'USDT'));
    expect(res.getByText('0.000001')).toBeInTheDocument();
  });
});
