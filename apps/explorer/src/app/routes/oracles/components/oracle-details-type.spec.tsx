import { render } from '@testing-library/react';
import { OracleDetailsType } from './oracle-details-type';
import type { SourceTypeName } from './oracle-details-type';

function renderComponent(type: SourceTypeName) {
  return <OracleDetailsType type={type} />;
}

function renderWrappedComponent(type: SourceTypeName) {
  return (
    <table>
      <tbody>{renderComponent(type)}</tbody>
    </table>
  );
}

describe('Oracle type view', () => {
  it('Renders nothing when type is null', () => {
    const res = render(renderComponent(null as unknown as SourceTypeName));
    expect(res.container).toBeEmptyDOMElement();
  });

  it('Renders Internal time for internal sources', () => {
    const res = render(renderWrappedComponent('DataSourceDefinitionInternal'));
    expect(res.getByText('Internal time')).toBeInTheDocument();
  });

  it('Renders External data otherwise', () => {
    const res = render(renderWrappedComponent('DataSourceDefinitionExternal'));
    expect(res.getByText('External data')).toBeInTheDocument();
  });
});
