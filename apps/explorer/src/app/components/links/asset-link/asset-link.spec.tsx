import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import type { MockedResponse } from '@apollo/client/testing';
import { render, waitFor } from '@testing-library/react';
import { AssetLink } from './asset-link';
import { mockAssetA1 } from '../../../mocks/assets';

function renderComponent(id: string, mock: MockedResponse[]) {
  return (
    <MockedProvider mocks={mock} addTypename={false}>
      <MemoryRouter>
        <AssetLink assetId={id} />
      </MemoryRouter>
    </MockedProvider>
  );
}

jest.mock('../../emblem-with-chain/emblem-with-chain');

describe('AssetLink', () => {
  it('renders the asset id when not found and makes the button disabled', async () => {
    const res = render(renderComponent('123', [mockAssetA1]));
    expect(res.getByText('123')).toBeInTheDocument();
    expect(await res.findByTestId('asset-link')).toBeDisabled();
    await waitFor(async () => {
      expect(await res.queryByText('A ONE')).toBeFalsy();
    });
  });

  it('renders the asset name when found and make the button enabled', async () => {
    const res = render(renderComponent('123', [mockAssetA1]));
    expect(res.getByText('123')).toBeInTheDocument();

    await waitFor(async () => {
      expect(await res.findByText('A ONE')).toBeInTheDocument();
      expect(await res.findByTestId('asset-link')).not.toBeDisabled();
    });
  });
});
