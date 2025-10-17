'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { IconButton, LinkOverlay } from '@chakra-ui/react';
import {
  MenuContent,
  MenuItem,
  MenuItemCommand,
  MenuRoot,
  MenuTrigger
} from '@/components/ui/menu';
import { HiDotsHorizontal } from 'react-icons/hi';
import { PiCoins } from 'react-icons/pi';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import { EmptyState } from '../ui/empty-state';
import styles from './ZettleSalesTable.module.css';
import ZettleSaleService from '@/services/zettleSaleService';
import { deleteZettleSale } from '@/actions/zettleSales';
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
import CashitTable from '../CashitTable/CashitTable';

const columnHelper = createColumnHelper<SaleRow>();

type ZettleSale = Awaited<
  ReturnType<typeof ZettleSaleService.getForGroup>
>[number] & { user?: GammaUser };

interface SaleRow {
  id: number;
  description: string;
  group: string;
  groupId?: string;
  date: Date;
  person: string;
  total: number;
}

const ZettleSalesTable = ({
  e,
  superGroups,
  locale
}: {
  e: ZettleSale[];
  superGroups?: { superGroup: GammaSuperGroup; members: GammaGroupMember[] }[];
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);

  const sales = useMemo(() => {
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

    return e.map((sale) => {
      return {
        id: sale.id,
        description: sale.name,
        group: getGroupDisplayName(sale.gammaSuperGroupId),
        date: sale.saleDate,
        person: `${sale.user?.firstName} "${sale.user?.nick}" ${sale.user?.lastName}`,
        total: sale.amount
      } as SaleRow;
    });
  }, [superGroups, e, l.group.noGroup, l.group.unknownGroup]);

  const defaultColumns = [
    columnHelper.accessor('description', {
      header: l.general.description,
      cell: (info) => (
        <LinkOverlay
          as={Link}
          href={'/invoices/view?id=' + info.row.original.id}
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
    columnHelper.accessor('total', {
      header: l.expense.amount,
      cell: (info) => info.getValue().toFixed(2) + ' kr'
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => {
        const sale = info.row.original;
        return <SaleActions id={sale.id} locale={locale} />;
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
    data: sales,
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
          icon={<PiCoins />}
          title={l.zettleSales.listNotFound}
          description={l.zettleSales.listNotFoundDesc}
        />
      }
    />
  );
};

const SaleActions = ({ id, locale }: { id: number; locale: string }) => {
  const l = i18nService.getLocale(locale);
  const router = useRouter();

  const remove = useCallback(() => {
    deleteZettleSale(id).then(() => {
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
          onClick={() => router.push('/zettle-sales/view?id=' + id)}
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

export default ZettleSalesTable;
