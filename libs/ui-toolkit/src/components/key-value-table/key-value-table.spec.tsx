import { render, screen } from '@testing-library/react';
import type { KeyValueTableProps } from './key-value-table';
import { KeyValueTable, KeyValueTableRow } from './key-value-table';

const props: KeyValueTableProps = {
  title: 'Title',
  headingLevel: 3,
  children: undefined,
};

it('Renders the correct elements', () => {
  const { container } = render(
    <KeyValueTable {...props}>
      <KeyValueTableRow inline={true}>
        <span>My label</span>
        <span>My value</span>
      </KeyValueTableRow>
      <KeyValueTableRow>
        <span>My label 2</span>
        <span>My value 2</span>
      </KeyValueTableRow>
    </KeyValueTable>
  );

  expect(screen.getByText(props.title || '')).toBeInTheDocument();

  expect(screen.getByTestId('key-value-table')).toBeInTheDocument();
  expect(container.getElementsByTagName('dl')).toHaveLength(2);

  const rows = container.getElementsByTagName('dl');
  // Row 1
  expect(rows[0].firstChild).toHaveTextContent('My label');
  expect(rows[0].children[1]).toHaveTextContent('My value');

  // Row 2
  expect(rows[1].firstChild).toHaveTextContent('My label 2');
  expect(rows[1].children[1]).toHaveTextContent('My value 2');
});

it('Applies numeric class if prop is passed row not inline', () => {
  render(
    <KeyValueTable {...props} numerical={true}>
      <KeyValueTableRow inline={false}>
        <span>My label</span>
        <span>My value</span>
      </KeyValueTableRow>
    </KeyValueTable>
  );
  const row = screen.getByTestId('key-value-table-row');
  expect(row.children[1]).toHaveClass('font-mono');
});

it('Applies numeric class if prop is passed row inline', () => {
  render(
    <KeyValueTable {...props} numerical={true}>
      <KeyValueTableRow inline={true}>
        <span>My label</span>
        <span>My value</span>
      </KeyValueTableRow>
    </KeyValueTable>
  );

  const row = screen.getByTestId('key-value-table-row');
  expect(row.children[1]).toHaveClass('font-mono');
});

it('Applies id to row if passed', () => {
  render(
    <KeyValueTable>
      <KeyValueTableRow inline={false} id="thisistheid">
        <span>My value</span>
        <span>My value</span>
      </KeyValueTableRow>
    </KeyValueTable>
  );

  expect(screen.getByTestId('key-value-table-row')).toHaveAttribute(
    'id',
    'thisistheid'
  );
});
