import { render, waitFor } from '@testing-library/react';
import { NestedDataList, sortNestedDataByChildren } from './nested-data-list';
import userEvent from '@testing-library/user-event';

const mockData = {
  nonce: '5980890939790185837',
  validatorHeartbeat: {
    nodeId: 'e07d2cd299659590c16ec1cc1c69936ad747083c379ea6b6cfeaa6e22c8af0cb',
    ethereumSignature: {
      value:
        '8b157cb43a716ad541065f643e38cd92d7b1857c7beeb7d81e878be4f9a48f5a346be973e478eba3c18907888678625ba6700b086f65406d5ce0af0cae1d419300',
      algo: 'eth',
      version: 0,
    },
    vegaSignature: {
      value:
        'abffba6ddf07b3a732214dd780c35c94f7f0aeb9c5e9ce7d1a3ee641926a6ac568a2ecf0160c859633d327712c7a1b1590db4245d40646559a1ab2cc44d6fa01',
      algo: 'vega/ed25519',
      version: 0,
    },
  },
  blockHeight: '174534',
};

describe('NestedDataList', () => {
  it('should display the parent as a button', () => {
    const tree = render(<NestedDataList data={mockData} />);
    const { getAllByRole } = tree;
    expect(getAllByRole('button')[0]).toHaveTextContent('Validator Heartbeat');
  });

  it('should display the children when a row is clicked', async () => {
    const tree = render(<NestedDataList data={mockData} />);
    const user = userEvent.setup();
    const { getAllByRole } = tree;

    const parent = getAllByRole('listitem', { name: 'Validator Heartbeat' });
    const nestedContainer = parent[0].querySelector('[aria-hidden]');
    const expandBtn = parent[0].querySelector('button');
    expect(nestedContainer).toHaveAttribute('aria-hidden', 'false');
    await user.click(expandBtn as HTMLButtonElement);
    await waitFor(() => nestedContainer);
    expect(nestedContainer).toHaveAttribute('aria-hidden', 'true');
  });

  it('add border to the title of the parent', () => {
    const tree = render(<NestedDataList data={mockData} />);
    const { getAllByRole } = tree;
    const parent = getAllByRole('listitem', { name: 'Validator Heartbeat' });
    expect(parent[0]).toHaveClass('pl-4 border-l-4');
  });

  it('add a border the children with the same colour', () => {
    const tree = render(<NestedDataList data={mockData} />);
    const { getAllByRole } = tree;
    const parent = getAllByRole('listitem', { name: 'Validator Heartbeat' });
    expect(parent[0].querySelector('li')).toHaveClass('pl-4 border-l-4 pt-2');
  });

  it('should sort the data by values with children', () => {
    const mockData = {
      nonce: '5980890939790185837',
      validatorHeartbeat: {
        nodeId:
          'e07d2cd299659590c16ec1cc1c69936ad747083c379ea6b6cfeaa6e22c8af0cb',
        someArray: ['0', '1', '2'],
      },
      blockHeight: '174534',
    };
    const expected = ['nonce', 'blockHeight', 'validatorHeartbeat'];
    const result = sortNestedDataByChildren(mockData);
    expect(result).toStrictEqual(expected);
  });
});
