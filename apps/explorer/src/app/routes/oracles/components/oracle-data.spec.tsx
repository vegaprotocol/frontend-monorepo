import { render } from '@testing-library/react';
import { OracleData } from './oracle-data';
import { type ExplorerOracleDataConnectionFragment } from '../__generated__/Oracles';

type DataConnection = ExplorerOracleDataConnectionFragment['dataConnection'];

function renderComponent(
  data: ExplorerOracleDataConnectionFragment['dataConnection']
) {
  return <OracleData data={data} />;
}

describe('Oracle Data view', () => {
  it('Renders nothing when data is null', () => {
    const res = render(renderComponent(null as unknown as DataConnection));
    expect(res.container).toBeEmptyDOMElement();
  });

  it('Renders nothing when dataConnection is empty', () => {
    const res = render(renderComponent({} as DataConnection));
    expect(res.container).toBeEmptyDOMElement();
  });
  it('Renders nothing when dataConnection has no edges', () => {
    const res = render(
      renderComponent({
        dataConnection: {
          edges: null,
        },
      } as DataConnection)
    );
    expect(res.container).toBeEmptyDOMElement();
  });

  it('Renders nothing when dataConnection edges is empty', () => {
    const res = render(
      renderComponent({
        dataConnection: {
          edges: [],
        },
      } as unknown as DataConnection)
    );
    expect(res.container).toBeEmptyDOMElement();
  });

  // This stops short of asserting how the data is presented
  // because the current view is pretty rudimentary
  it('Renders details component when there is data', () => {
    const res = render(
      renderComponent({
        dataConnection: {
          edges: [
            {
              node: {
                externalData: {
                  data: {
                    broadcastAt: '2022-01-01',
                  },
                },
              },
            },
          ],
        },
      } as DataConnection)
    );
    expect(res.getByText('Broadcast data')).toBeInTheDocument();
  });
});
