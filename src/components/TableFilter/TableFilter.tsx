'use client';

import i18nService from '@/services/i18nService';
import { createListCollection, Input, NativeSelect } from '@chakra-ui/react';
import { Column } from '@tanstack/react-table';
import { useMemo } from 'react';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    filterVariant?: 'range' | 'select' | 'text';
  }
}

const TableFilter = ({
  column,
  locale
}: {
  column: Column<any, unknown>;
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);

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
      <div>
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
        <option value="">{l.general.all}</option>
        {selections.items.map((item) => (
          <option value={item.value} key={item.value}>
            {item.label}
          </option>
        ))}
      </NativeSelect.Field>
    </NativeSelect.Root>
  ) : (
    <Input
      onChange={(value) => column.setFilterValue(value.target.value)}
      placeholder={l.general.search}
      type="text"
      value={(columnFilterValue ?? '') as string}
    />
  );
};

export default TableFilter;
