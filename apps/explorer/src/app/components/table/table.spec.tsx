import { render, screen } from '@testing-library/react';

import { Table, TableRow, TableHeader, TableCell } from './index';

describe('Renders all table components', () => {
  render(
    <Table data-testid="test-table">
      <TableRow data-testid="test-tr">
        <TableHeader data-testid="test-th">Title</TableHeader>
        <TableCell data-testid="test-td">Content</TableCell>
      </TableRow>
    </Table>
  );

  expect(screen.getByTestId('test-table')).toBeInTheDocument();
  expect(screen.getByTestId('test-tr')).toBeInTheDocument();
  expect(screen.getByTestId('test-th')).toHaveTextContent('Title');
  expect(screen.getByTestId('test-td')).toHaveTextContent('Content');
});

describe('Table row', () => {
  it('should include classes based on custom "modifier" prop', () => {
    render(
      <Table>
        <TableRow data-testid="modifier-test" modifier="bordered">
          <TableCell>With modifier</TableCell>
        </TableRow>
      </Table>
    );

    expect(screen.getByTestId('modifier-test')).toHaveClass('border-white-40');
  });
});

describe('Table header', () => {
  it('should accept props i.e. scope="row"', () => {
    render(
      <Table>
        <TableRow>
          <TableHeader data-testid="props-test" scope="row">
            Test
          </TableHeader>
        </TableRow>
      </Table>
    );

    expect(screen.getByTestId('props-test')).toHaveAttribute('scope');
  });

  it('should include custom class based on scope="row"', () => {
    render(
      <Table>
        <TableRow>
          <TableHeader data-testid="scope-class-test" scope="row">
            With scope attribute
          </TableHeader>
        </TableRow>
      </Table>
    );

    expect(screen.getByTestId('scope-class-test')).toHaveClass('text-left');
  });
});

describe('Table cell', () => {
  it('should include class based on custom "modifier" prop', () => {
    render(
      <Table>
        <TableRow>
          <TableCell data-testid="modifier-class-test" modifier="bordered">
            With modifier
          </TableCell>
        </TableRow>
      </Table>
    );

    expect(screen.getByTestId('modifier-class-test')).toHaveClass('py-4');
  });
});
