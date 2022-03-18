import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Table, TableRow, TableHeader, TableCell } from './index';

describe('Renders all table components', () => {
  const { container } = render(
    <Table data-testid="test-table">
      <TableRow data-testid="test-tr">
        <TableHeader data-testid="test-th">Title</TableHeader>
        <TableCell data-testid="test-td">Content</TableCell>
      </TableRow>
    </Table>
  );

  const table = container.querySelector('[data-testid="test-table"]');
  const tr = container.querySelector('[data-testid="test-tr"]');
  const th = container.querySelector('[data-testid="test-th"]');
  const td = container.querySelector('[data-testid="test-td"]');

  expect(table).toBeInTheDocument();
  expect(th).toBeInTheDocument();
  expect(tr).toBeInTheDocument();
  expect(td).toBeInTheDocument();
});

describe('Table row', () => {
  it('should include classes based on custom "modifier" prop', () => {
    const { baseElement: withoutModifier } = render(
      <Table>
        <TableRow>
          <TableCell>Without modifier</TableCell>
        </TableRow>
      </Table>
    );

    const { baseElement: withModifier } = render(
      <Table>
        <TableRow modifier="bordered">
          <TableCell>With modifier</TableCell>
        </TableRow>
      </Table>
    );

    const noModifierTr = withoutModifier.querySelector('tr');
    const modifierTr = withModifier.querySelector('tr');
    const classNameToCheck = 'border-white-40';

    expect(noModifierTr && !noModifierTr.classList.contains(classNameToCheck));
    expect(modifierTr && modifierTr.classList.contains(classNameToCheck));
  });
});

describe('Table header', () => {
  it('should accept props i.e. scope="row"', () => {
    const { baseElement } = render(
      <Table>
        <TableRow>
          <TableHeader scope="row">Test</TableHeader>
        </TableRow>
      </Table>
    );

    const th = baseElement.querySelector('th');

    expect(th && th.hasAttribute('scope'));
  });

  it('should include custom class based on scope="row"', () => {
    const { baseElement: withoutScope } = render(
      <Table>
        <TableRow>
          <TableHeader>Without scope attribute</TableHeader>
        </TableRow>
      </Table>
    );

    const { baseElement: withScope } = render(
      <Table>
        <TableRow>
          <TableHeader scope="row">With scope attribute</TableHeader>
        </TableRow>
      </Table>
    );

    const withoutScopeTr = withoutScope.querySelector('tr');
    const withScopeTr = withScope.querySelector('tr');
    const classNameToCheck = 'text-left';

    expect(
      withoutScopeTr && !withoutScopeTr.classList.contains(classNameToCheck)
    );
    expect(withScopeTr && withScopeTr.classList.contains(classNameToCheck));
  });
});

describe('Table cell', () => {
  it('should include class based on custom "modifier" prop', () => {
    const { baseElement: withoutModifier } = render(
      <Table>
        <TableRow>
          <TableCell>Without modifier</TableCell>
        </TableRow>
      </Table>
    );

    const { baseElement: withModifier } = render(
      <Table>
        <TableRow>
          <TableCell modifier="bordered">With modifier</TableCell>
        </TableRow>
      </Table>
    );

    const noModifierTd = withoutModifier.querySelector('td');
    const modifierTd = withModifier.querySelector('td');
    const classNameToCheck = 'py-4';

    expect(noModifierTd && !noModifierTd.classList.contains(classNameToCheck));
    expect(modifierTd && modifierTd.classList.contains(classNameToCheck));
  });
});
