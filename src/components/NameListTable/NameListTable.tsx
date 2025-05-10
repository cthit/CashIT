'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { IconButton, Table, LinkBox, LinkOverlay, Box } from '@chakra-ui/react';
import {
  MenuContent,
  MenuItem,
  MenuItemCommand,
  MenuRoot,
  MenuTrigger
} from '@/components/ui/menu';
import { HiDotsHorizontal } from 'react-icons/hi';
import { PiUserList } from 'react-icons/pi';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import { EmptyState } from '../ui/empty-state';
import styles from './NameListTable.module.css';
import NameListService from '@/services/nameListService';
import { deleteNameList } from '@/actions/nameLists';
import { NameListType } from '@prisma/client';
import { GammaGroup, GammaPost, GammaUser } from '@/types/gamma';
import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import TableFilter from '../TableFilter/TableFilter';

type NameList = Omit<
  Awaited<ReturnType<typeof NameListService.getPrettifiedForGroup>>[number],
  'user'
> & { user?: GammaUser };

const columnHelper = createColumnHelper<NameListRow>();

interface NameListRow {
  id: number;
  description: string;
  group: string;
  groupId?: string;
  date: Date;
  person: string;
  tracked: string;
  peopleCount: number;
  type: NameListType;
}

const NameListTable = ({
  e,
  groups,
  locale
}: {
  e: NameList[];
  groups: { group: GammaGroup; post: GammaPost }[];
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);

  const rows = useMemo(() => {
    const groupsReverse = groups.reduce((acc, group) => {
      acc[group.group.id] = group;
      return acc;
    }, {} as Record<string, { group: GammaGroup; post: GammaPost }>);

    return e.map(
      (list) =>
        ({
          id: list.id,
          description: list.name,
          group: list.gammaGroupId
            ? groupsReverse[list.gammaGroupId]?.group.prettyName ??
              l.group.noGroup
            : l.group.noGroup,
          groupId: list.gammaGroupId,
          date: list.occurredAt,
          person: `${list.user?.firstName} "${list.user?.nick}" ${list.user?.lastName}`,
          tracked: list.tracked ? 'Yes' : 'No',
          peopleCount: list.names.length + list.gammaNames.length,
          type: ListTypeText({ type: list.type, locale })
        } as NameListRow)
    );
  }, [e, groups, locale]);

  const defaultColumns = [
    columnHelper.accessor('description', {
      header: l.general.description,
      cell: (info) => (
        <LinkOverlay
          as={Link}
          href={'/name-lists/view?id=' + info.row.original.id}
          className={styles.overlay}
        >
          {info.getValue()}
        </LinkOverlay>
      )
    }),
    columnHelper.accessor('group', {
      header: l.expense.group,
      cell: (info) => info.getValue(),
      meta: {
        filterVariant: 'select'
      }
    }),
    columnHelper.accessor('date', {
      header: l.expense.date,
      cell: (info) => info.getValue().toLocaleDateString()
    }),
    columnHelper.accessor('person', {
      header: l.expense.person,
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('tracked', {
      header: l.nameLists.tracked,
      cell: (info) => info.getValue(),
      meta: {
        filterVariant: 'select'
      }
    }),
    columnHelper.accessor('peopleCount', {
      header: l.nameLists.people,
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('type', {
      header: l.expense.type,
      cell: (info) => info.getValue(),
      meta: {
        filterVariant: 'select'
      }
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => {
        const list = info.row.original;
        return <NameListActions id={list.id} locale={locale} />;
      }
    })
  ];

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'date',
      desc: true
    }
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    columns: defaultColumns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters
    }
  });

  return (
    <Table.Root>
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
              <Table.Cell key={cell.id} py="1" textOverflow="ellipsis">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Table.Cell>
            ))}
          </LinkBox>
        ))}
      </Table.Body>
      {table.getRowModel().rows.length === 0 && (
        <Table.Caption>
          <EmptyState
            icon={<PiUserList />}
            title={l.nameLists.listNotFound}
            description={l.nameLists.listNotFoundDesc}
          />
        </Table.Caption>
      )}
    </Table.Root>
  );
};

const NameListActions = ({ id, locale }: { id: number; locale: string }) => {
  const l = i18nService.getLocale(locale);
  const router = useRouter();

  const remove = useCallback(() => {
    deleteNameList(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton size="sm" variant="subtle" ml="0.25rem">
          <HiDotsHorizontal />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem
          value="edit"
          cursor="pointer"
          onClick={() => router.push('/name-lists/view?id=' + id)}
        >
          {l.general.edit}
        </MenuItem>
        <MenuItem color="fg.error" value="delete" onClick={remove}>
          {l.general.delete} <MenuItemCommand>D</MenuItemCommand>
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
};

const ListTypeText = ({
  type,
  locale
}: {
  type: NameListType;
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);

  switch (type) {
    case NameListType.EVENT:
      return l.nameLists.types.event;
    case NameListType.PROFILE_CLOTHING:
      return l.nameLists.types.profileClothing;
    case NameListType.TEAMBUILDING:
      return l.nameLists.types.teambuilding;
    case NameListType.WORK_FOOD:
      return l.nameLists.types.workFood;
  }
};

export default NameListTable;
