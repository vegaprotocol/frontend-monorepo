import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssetDropdown } from './asset-dropdown';

const createAssets = (count = 3) => {
  return new Array(count).fill(null).map((_, i) => ({
    id: i.toString(),
    symbol: 'asset-1',
  }));
};

describe('AssetDropdown', () => {
  const assets = createAssets();

  it('renders and selects chosen assets', async () => {
    const mockOnSelect = jest.fn();
    render(
      <AssetDropdown
        checkedAssets={[]}
        assets={assets}
        onSelect={mockOnSelect}
      />
    );
    await userEvent.click(screen.getByRole('button'));
    const items = screen.getAllByRole('menuitemcheckbox');
    expect(items).toHaveLength(assets.length);
    expect(items.map((i) => i.textContent)).toEqual(
      assets.map((a) => a.symbol)
    );
    await userEvent.click(items[0]);
    expect(mockOnSelect).toHaveBeenCalledWith(assets[0].id, true);
  });

  it('unselects already selected assets', async () => {
    const mockOnSelect = jest.fn();
    render(
      <AssetDropdown
        checkedAssets={[assets[0].id]}
        assets={assets}
        onSelect={mockOnSelect}
      />
    );
    await userEvent.click(screen.getByRole('button'));
    const items = screen.getAllByRole('menuitemcheckbox');
    await userEvent.click(items[0]);
    expect(mockOnSelect).toHaveBeenCalledWith(assets[0].id, false);
  });

  it('doesnt render if no assets provided', async () => {
    const { container } = render(
      <AssetDropdown checkedAssets={[]} assets={[]} onSelect={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
