import { Table } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { Flex, Text } from '@chakra-ui/react';
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight
} from 'react-icons/lu';

const TablePagination = ({ table }: { table: Table<any> }) => {
  return (
    <Flex alignItems="center" justifyContent="center" gap="0.5rem" mt="1rem">
      <Button
        onClick={() => table.firstPage()}
        disabled={!table.getCanPreviousPage()}
        variant="subtle"
        size="xs"
      >
        <LuChevronsLeft />
      </Button>
      <Button
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        variant="subtle"
        size="xs"
      >
        <LuChevronLeft />
      </Button>
      <Text>
        {table.getState().pagination.pageIndex + 1} /{' '}
        {Math.max(table.getPageCount(), 1)}
      </Text>
      <Button
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        variant="subtle"
        size="xs"
      >
        <LuChevronRight />
      </Button>
      <Button
        onClick={() => table.lastPage()}
        disabled={!table.getCanNextPage()}
        variant="subtle"
        size="xs"
      >
        <LuChevronsRight />
      </Button>
    </Flex>
  );
};

export default TablePagination;
