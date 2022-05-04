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
      <KeyValueTableRow>
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

it('Applies numeric class if prop is passed', () => {
  render(
    <KeyValueTable {...props} numerical={true}>
      <KeyValueTableRow>
        <span>My label</span>
        <span>My value</span>
      </KeyValueTableRow>
    </KeyValueTable>
  );

  expect(screen.getByTestId('key-value-table')).toHaveClass(
    'w-full border-collapse mb-8 [border-spacing:0] break-all'
  );
});

it('Applies muted class if prop is passed', () => {
  render(
    <KeyValueTable {...props} muted={true}>
      <KeyValueTableRow>
        <span>My label</span>
        <span>My value</span>
      </KeyValueTableRow>
    </KeyValueTable>
  );

  expect(screen.getByTestId('key-value-table')).toHaveClass(
    'w-full border-collapse mb-8 [border-spacing:0] break-all'
  );
});
