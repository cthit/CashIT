import { Box, LinkBox, Table } from '@chakra-ui/react';
import { flexRender, Table as TTable } from '@tanstack/react-table';
import TableFilter from '../TableFilter/TableFilter';
import TablePagination from '../TablePagination/TablePagination';

const CashitTable = ({
  table,
  cellWidths = {},
  locale,
  emptyStateComponent
}: {
  table: TTable<any>;
  cellWidths: Record<string, string>;
  locale: string;
  emptyStateComponent: React.ReactNode;
}) => {
  return (
    <Table.Root w="100%" tableLayout="fixed">
      <Table.ColumnGroup>
        {table
          .getHeaderGroups()
          .map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <Table.Column key={header.id} w={cellWidths[header.column.id]} />
            ))
          )}
      </Table.ColumnGroup>
      <Table.Header>
        <Table.Row>
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => {
              return (
                <Table.ColumnHeader key={header.id} colSpan={header.colSpan}>
                  <Box
                    onClick={header.column.getToggleSortingHandler()}
                    cursor={header.column.getCanSort() ? 'pointer' : undefined}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() &&
                      ({
                        asc: '▴',
                        desc: '▾'
                      }[header.column.getIsSorted() as string] ??
                        '⇅')}
                  </Box>
                  {header.column.getCanFilter() ? (
                    <TableFilter column={header.column} locale={locale} />
                  ) : null}
                </Table.ColumnHeader>
              );
            })
          )}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows.map((row) => (
          <LinkBox as={Table.Row} _hover={{ bg: 'bg.subtle' }} key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Table.Cell
                key={cell.id}
                py="1"
                textOverflow="ellipsis"
                textWrap="nowrap"
                overflow="hidden"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </LinkBox>
        ))}
      </Table.Body>
      <Table.Caption>
        {table.getRowModel().rows.length === 0 && emptyStateComponent}
        <TablePagination table={table} />
      </Table.Caption>
    </Table.Root>
  );
};

export default CashitTable;
