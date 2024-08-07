import { render, screen } from '@testing-library/react';

import { ConditionalDataTable, type RowConfig } from './conditional-data-table';

describe('ConditionalDataTable', () => {
  it('should render components where data is defined', () => {
    const rows: RowConfig<{ foo: string; bar: string | undefined | null }>[] = [
      {
        prop: 'foo',
        render: () => ['foo', <div></div>],
      },
      {
        prop: 'bar',
        render: () => ['bar', <div></div>],
      },
    ];
    render(
      <ConditionalDataTable items={rows} data={{ foo: 'foo', bar: null }} />
    );
    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.queryByText('bar')).not.toBeInTheDocument();
  });

  it('should not render for null, undefined, empty string', () => {
    const rows: RowConfig<{ foo: string; bar: string | undefined | null }>[] = [
      {
        prop: 'foo',
        render: () => ['foo', <div></div>],
      },
      {
        prop: 'bar',
        render: () => ['bar', <div></div>],
      },
    ];
    render(
      <ConditionalDataTable items={rows} data={{ foo: 'foo', bar: null }} />
    );
    expect(screen.queryByText('bar')).not.toBeInTheDocument();

    render(
      <ConditionalDataTable
        items={rows}
        data={{ foo: 'foo', bar: undefined }}
      />
    );
    expect(screen.queryByText('bar')).not.toBeInTheDocument();

    render(
      <ConditionalDataTable items={rows} data={{ foo: 'foo', bar: '' }} />
    );
    expect(screen.queryByText('bar')).not.toBeInTheDocument();

    render(
      <ConditionalDataTable items={rows} data={{ foo: 'foo', bar: 'bar' }} />
    );
    expect(screen.getByText('bar')).toBeInTheDocument();
  });

  it('should not render if props contains at least one undefined field', () => {
    const rows: RowConfig<{ foo: string; bar?: string | null }>[] = [
      {
        prop: 'foo',
        render: () => ['foo', <div></div>],
      },
      {
        prop: 'foo',
        props: ['foo', 'bar'],
        render: () => ['bar', <div></div>],
      },
    ];
    render(<ConditionalDataTable items={rows} data={{ foo: 'foo' }} />);
    expect(screen.queryByText('bar')).not.toBeInTheDocument();
  });

  it('should render if all fields in props are defined', () => {
    const rows: RowConfig<{ foo: string; bar: string | undefined | null }>[] = [
      {
        prop: 'foo',
        render: () => ['foo', <div></div>],
      },
      {
        prop: 'foo',
        props: ['foo', 'bar'],
        render: () => ['bar', <div></div>],
      },
    ];
    render(
      <ConditionalDataTable items={rows} data={{ foo: 'foo', bar: 'bar' }} />
    );
    expect(screen.getByText('bar')).toBeInTheDocument();
  });
});
