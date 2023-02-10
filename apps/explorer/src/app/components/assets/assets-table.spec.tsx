import { render, waitFor } from '@testing-library/react';
import { assetsList } from '../../mocks/assets';
import { AssetsTable } from './assets-table';

describe('AssetsTable', () => {
  it('shows loading message on first render', async () => {
    const res = render(<AssetsTable data={null} />);
    expect(await res.findByText('Loading...')).toBeInTheDocument();
  });

  it('shows no data message if no assets found', async () => {
    const res = render(<AssetsTable data={[]} />);
    expect(
      await res.findByText('This chain has no assets')
    ).toBeInTheDocument();
  });

  it('shows a table/list with all the assets', async () => {
    const res = render(<AssetsTable data={assetsList} />);
    await waitFor(() => {
      const rowA1 = res.container.querySelector('[row-id="123"]');
      expect(rowA1).toBeInTheDocument();

      const rowA2 = res.container.querySelector('[row-id="456"]');
      expect(rowA2).toBeInTheDocument();
    });
  });
});
