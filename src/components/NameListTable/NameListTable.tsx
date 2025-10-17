'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { IconButton, LinkOverlay } from '@chakra-ui/react';
import {
  MenuContent,
  MenuItem,
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
import { GammaGroupMember, GammaSuperGroup, GammaUser } from '@/types/gamma';
import {
  ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import { HiTrash } from 'react-icons/hi2';
import CashitTable from '../CashitTable/CashitTable';

type NameList = Awaited<
  ReturnType<typeof NameListService.getForGroup>
>[number] & { user?: GammaUser };

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
  superGroups,
  locale
}: {
  e: NameList[];
  superGroups?: { superGroup: GammaSuperGroup; members: GammaGroupMember[] }[];
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);

  const rows = useMemo(() => {
    const superGroupsReverse =
      superGroups?.reduce((acc, sg) => {
        acc[sg.superGroup.id] = sg.superGroup;
        return acc;
      }, {} as Record<string, GammaSuperGroup>) ?? {};

    const getGroupDisplayName = (superGroupId: string | null): string => {
      if (!superGroupId) return l.group.noGroup;

      const superGroup = superGroupId ? superGroupsReverse[superGroupId] : null;
      if (superGroup) return superGroup.prettyName;

      return l.group.unknownGroup;
    };

    return e.map(
      (list) =>
        ({
          id: list.id,
          description: list.name,
          group: getGroupDisplayName(list.gammaSuperGroupId),
          groupId: list.gammaGroupId,
          date: list.occurredAt,
          person: `${list.user?.firstName} "${list.user?.nick}" ${list.user?.lastName}`,
          tracked: list.tracked ? 'Yes' : 'No',
          peopleCount: list.names.length + list.gammaNames.length,
          type: ListTypeText({ type: list.type, locale })
        } as NameListRow)
    );
  }, [superGroups, e, l.group.noGroup, l.group.unknownGroup, locale]);

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
    },
    initialState: {
      pagination: {
        pageSize: 15
      }
    }
  });

  return (
    <CashitTable
      table={table}
      cellWidths={{}}
      locale={locale}
      emptyStateComponent={
        <EmptyState
          icon={<PiUserList />}
          title={l.nameLists.listNotFound}
          description={l.nameLists.listNotFoundDesc}
        />
      }
    />
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
        <MenuItem color="fg.error" value="delete" onClick={remove}>
          <HiTrash /> {l.general.delete}
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
