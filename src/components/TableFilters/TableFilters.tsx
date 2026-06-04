import { Table as TTable } from '@tanstack/react-table';
import TableFilter from '../TableFilter/TableFilter';
import { HiOutlineFilter } from 'react-icons/hi';
import { MenuContent, MenuRoot, MenuTrigger } from '../ui/menu';
import { Button } from '../ui/button';

const TableFilters = ({
  table,
  locale
}: {
  table: TTable<any>;
  locale: string;
}) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button variant="subtle">
          <HiOutlineFilter /> Filters
        </Button>
      </MenuTrigger>
      <MenuContent>
        {table.getHeaderGroups().map((headerGroup) =>
          headerGroup.headers.map((header) => {
            return header.column.getCanFilter() ? (
              <TableFilter header={header} locale={locale} key={header.id} />
            ) : null;
          })
        )}
      </MenuContent>
    </MenuRoot>
  );
};

export default TableFilters;
