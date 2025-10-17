'use client';

import i18nService from '@/services/i18nService';
import { createListCollection, Input } from '@chakra-ui/react';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from '@/components/ui/select';
import { Column, ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { useMemo } from 'react';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    filterVariant?: 'range' | 'select' | 'text';
    defaultExcludeSelect?: string[];
  }
}

const TableFilter = ({
  column,
  locale
}: {
  column: Column<any, unknown>;
  locale: string;
  excludeDefault?: string[];
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
    [column, filterVariant]
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
    <SelectRoot
      collection={selections}
      multiple
      value={
        column.getFilterValue()
          ? Array.isArray(column.getFilterValue())
            ? (column.getFilterValue() as unknown[]).map(String)
            : [String(column.getFilterValue())]
          : []
      }
      onValueChange={({ value }) => {
        column.setFilterValue(value);
      }}
      disabled={selections.items.length === 0}
      closeOnSelect={false}
      marginTop="-0.4rem"
    >
      <SelectLabel />
      <SelectTrigger>
        <SelectValueText
          textOverflow="ellipsis"
          textWrap="nowrap"
          display="block"
        />
      </SelectTrigger>
      <SelectContent position="absolute">
        {selections.items.map((item) => (
          <SelectItem key={item.value} item={item} textWrap="nowrap">
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  ) : (
    <Input
      onChange={(value) => column.setFilterValue(value.target.value)}
      placeholder={l.general.search}
      type="text"
      value={(columnFilterValue ?? '') as string}
    />
  );
};

function initializeFilters<T>(
  columns: ColumnDef<T, any>[],
  data: any[]
): ColumnFiltersState {
  return columns
    .filter((col) => col.meta?.filterVariant === 'select')
    .map((col) => {
      const id = (col as any)?.accessorKey as keyof T;
      const exclude = col.meta?.defaultExcludeSelect ?? [];
      const values = [
        ...new Set(
          data
            .map((row) => row[id])
            .filter((v) => v !== undefined && !exclude.includes(v as string))
        )
      ];
      return values.length ? { id: id as string, value: values } : null;
    })
    .filter(Boolean) as ColumnFiltersState;
}

export default TableFilter;
export { initializeFilters };
