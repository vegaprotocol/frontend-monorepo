import { render } from '@testing-library/react';
import { OracleDetailsType, isInternalSourceType } from './oracle-details-type';
import type { SourceType } from './oracle';
import { PropertyKeyType } from '@vegaprotocol/types';

function renderComponent(type: SourceType) {
  return <OracleDetailsType sourceType={type} />;
}

function renderWrappedComponent(type: SourceType) {
  return (
    <table>
      <tbody>{renderComponent(type)}</tbody>
    </table>
  );
}

function mock(name: string): SourceType {
  return {
    sourceType: {
      filters: [
        {
          __typename: 'Filter',
          key: {
            name,
            type: PropertyKeyType.TYPE_STRING,
          },
        },
      ],
    },
  };
}

describe('Oracle type view', () => {
  it('Renders nothing when type is null', () => {
    const res = render(renderComponent(null as unknown as SourceType));
    expect(res.container).toBeEmptyDOMElement();
  });

  it('Renders Internal time for internal sources - timestamp', () => {
    const s = mock('vegaprotocol.builtin.timestamp');
    expect(isInternalSourceType(s)).toEqual(true);
    const res = render(renderWrappedComponent(s));
    expect(res.getByText('Internal data')).toBeInTheDocument();
  });

  it('Renders Internal time for internal sources - potential future types', () => {
    const s = mock('vegaprotocol.builtin.boolean');
    expect(isInternalSourceType(s)).toEqual(true);
    const res = render(renderWrappedComponent(s));
    expect(res.getByText('Internal data')).toBeInTheDocument();
  });

  it('Renders External data otherwise - prices.external.whatever', () => {
    const s = mock('prices.external.whatever');
    expect(isInternalSourceType(s)).toEqual(false);
    const res = render(renderWrappedComponent(s));
    expect(res.getByText('External Data')).toBeInTheDocument();
  });

  it('Renders External data otherwise', () => {
    const s = mock('prices.external.vegaprotocol.builtin.');
    expect(isInternalSourceType(s)).toEqual(false);
    const res = render(renderWrappedComponent(s));
    expect(res.getByText('External Data')).toBeInTheDocument();
  });
});
