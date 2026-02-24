import { Box, Flex, Table } from '@chakra-ui/react';
import { flexRender, Table as TTable } from '@tanstack/react-table';
import TableFilter from '../TableFilter/TableFilter';
import TablePagination from '../TablePagination/TablePagination';
import { useRouter } from 'next/navigation';
import styles from './CashitTable.module.css';

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
  const router = useRouter();
  const handleRowClick = (url: string | undefined, e: React.MouseEvent) => {
    // Don't navigate if clicking on the actions menu
    const target = e.target as HTMLElement;
    if (
      !url ||
      target.closest('button') ||
      target.closest('[role="menu"]') ||
      target.closest('[role="dialog"]')
    ) {
      return;
    }
    router.push(url);
  };
  const isEmpty = table.getRowModel().rows.length === 0;

  return (
    <Flex flexDir="column" w="100%">
      <Box
        p="1px"
        overflowX="auto"
        overflowY="visible"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <Table.Root
          w="100%"
          textWrap="nowrap"
          minW={table.getAllColumns().length * 150}
          tableLayout="fixed"
          variant="outline"
          rounded="md"
          interactive
          className={styles.table}
        >
          <Table.ColumnGroup>
            {table
              .getHeaderGroups()
              .map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <Table.Column
                    key={header.id}
                    w={cellWidths[header.column.id]}
                  />
                ))
              )}
          </Table.ColumnGroup>
          <Table.Header>
            <Table.Row>
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => {
                  return (
                    <Table.ColumnHeader
                      key={header.id}
                      colSpan={header.colSpan}
                      className={styles.headerCell}
                    >
                      <Box
                        onClick={header.column.getToggleSortingHandler()}
                        cursor={
                          header.column.getCanSort() ? 'pointer' : undefined
                        }
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
              <Table.Row
                key={row.id}
                onClick={(e) => handleRowClick(row.original.url, e)}
                cursor={row.original.url ? 'pointer' : 'default'}
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    textOverflow="ellipsis"
                    textWrap="nowrap"
                    overflow="hidden"
                    py="1"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
      {isEmpty && emptyStateComponent}
      <TablePagination table={table} />
    </Flex>
  );
};

export default CashitTable;
