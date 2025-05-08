'use client';

import { createListCollection, Input, NativeSelect } from '@chakra-ui/react';
import { Column } from '@tanstack/react-table';
import { useMemo } from 'react';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    filterVariant?: 'range' | 'select' | 'text';
  }
}

const TableFilter = ({ column }: { column: Column<any, unknown> }) => {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};
  const sortedUniqueValues = useMemo(
    () =>
      filterVariant === 'range'
        ? []
        : Array.from(column.getFacetedUniqueValues().keys())
            .sort()
            .slice(0, 5000),
    [column.getFacetedUniqueValues(), filterVariant]
  );
  const selections = useMemo(
    () =>
      createListCollection({
        items: sortedUniqueValues.map((val) => ({
          label: val,
          value: val
        }))
      }),
    [sortedUniqueValues]
  );

  console.log('filterValue', columnFilterValue);

  return filterVariant === 'range' ? (
    <div>
      <div className="flex space-x-2">
        {/* See faceted column filters example for min max values functionality */}
        <Input
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
        />
        <Input
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === 'select' ? (
    <NativeSelect.Root>
      <NativeSelect.Field
        onChange={(e) => column.setFilterValue(e.target.value)}
        value={columnFilterValue?.toString()}
        bg="bg"
      >
        <option value="">All</option>
        {selections.items.map((item) => (
          //dynamically generated select options from faceted values feature
          <option value={item.value} key={item.value}>
            {item.label}
          </option>
        ))}
      </NativeSelect.Field>
    </NativeSelect.Root>
  ) : (
    <Input
      className="w-36 border shadow rounded"
      onChange={(value) => column.setFilterValue(value.target.value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? '') as string}
    />
    // See faceted column filters example for datalist search suggestions
  );
};

export default TableFilter;
