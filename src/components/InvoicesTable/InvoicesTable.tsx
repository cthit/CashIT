'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import {
  markInvoiceAsSent,
  markInvoiceAsNotSent,
  deleteInvoice,
  requestInvoiceRevision,
  approveInvoice
} from '@/actions/invoices';
import {
  Badge,
  Box,
  IconButton,
  LinkBox,
  LinkOverlay,
  Separator,
  Table,
  Text
} from '@chakra-ui/react';
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger
} from '@/components/ui/menu';
import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger
} from '@/components/ui/popover';
import { HiDotsHorizontal } from 'react-icons/hi';
import { RequestStatus } from '@prisma/client';
import { PiChatFill, PiFileX, PiReceipt } from 'react-icons/pi';
import InvoiceService from '@/services/invoiceService';
import { EmptyState } from '../ui/empty-state';
import Link from 'next/link';
import styles from './InvoicesTable.module.css';
import i18nService from '@/services/i18nService';
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
import TablePagination from '../TablePagination/TablePagination';
import { HiCheck, HiTrash, HiXMark } from 'react-icons/hi2';

type Invoice = Awaited<
  ReturnType<typeof InvoiceService.getForGroup>
>[number] & { user?: GammaUser };

const columnHelper = createColumnHelper<InvoiceRow>();

type InvoiceStatus = RequestStatus | 'FINISHED';

interface InvoiceRow {
  id: number;
  description: string;
  group: string;
  date: Date;
  person: string;
  total: number;
  status: InvoiceStatus;
  statusText: string;
  groupId?: string;
}

const InvoicesTable = ({
  e,
  locale,
  groups
}: {
  e: Invoice[];
  locale: string;
  groups: { group: GammaGroup; post: GammaPost }[];
}) => {
  const l = i18nService.getLocale(locale);

  const invoices = useMemo(() => {
    const groupsReverse = groups.reduce((acc, group) => {
      acc[group.group.id] = group;
      return acc;
    }, {} as Record<string, { group: GammaGroup; post: GammaPost }>);

    return e.map((invoice) => {
      const status: InvoiceStatus =
        invoice.sentAt !== null ? 'FINISHED' : invoice.status;
      return {
        id: invoice.id,
        description: invoice.name,
        group: invoice.gammaGroupId
          ? groupsReverse[invoice.gammaGroupId]?.group.prettyName ??
            l.group.noGroup
          : l.group.noGroup,
        date: invoice.createdAt,
        person:
          invoice.user?.firstName +
          ' "' +
          invoice.user?.nick +
          '" ' +
          invoice.user?.lastName,
        total: InvoiceService.calculateSumForItems(invoice.items),
        status: status,
        statusText: RequestStatusText({ b: status, locale: locale }),
        groupId: invoice.gammaGroupId
      } as InvoiceRow;
    });
  }, [e, groups, locale]);

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
    columnHelper.accessor('statusText', {
      header: l.expense.status,
      cell: (info) => (
        <RequestStatusBadge b={info.row.original.status} locale={locale} />
      ),
      meta: {
        filterVariant: 'select'
      },
      sortingFn: (rowA, rowB) => {
        const statusA = rowA.original.status as InvoiceStatus;
        const statusB = rowB.original.status as InvoiceStatus;
        const order = [
          RequestStatus.PENDING,
          RequestStatus.PENDING_REVISED,
          RequestStatus.APPROVED,
          RequestStatus.REJECTED,
          'FINISHED'
        ];
        return order.indexOf(statusA) - order.indexOf(statusB);
      }
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => {
        const invoice = info.row.original;
        return <InvoiceActions {...invoice} locale={locale} />;
      }
    })
  ];

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'statusText',
      desc: false
    },
    {
      id: 'date',
      desc: true
    }
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    columns: defaultColumns,
    data: invoices,
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
      <Table.Caption>
        {table.getRowModel().rows.length === 0 && (
          <EmptyState
            icon={<PiFileX />}
            title={l.invoice.listNotFound}
            description={l.invoice.listNotFoundDesc}
          />
        )}
        <TablePagination table={table} />
      </Table.Caption>
    </Table.Root>
  );
};

const InvoiceActions = ({
  id,
  status,
  description,
  locale
}: InvoiceRow & {
  locale: string;
}) => {
  const router = useRouter();
  const l = i18nService.getLocale(locale);

  const markUnpaid = useCallback(() => {
    markInvoiceAsNotSent(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  const markPaid = useCallback(() => {
    markInvoiceAsSent(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  const remove = useCallback(() => {
    deleteInvoice(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  const approve = useCallback(() => {
    approveInvoice(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  const requestRevision = useCallback(() => {
    requestInvoiceRevision(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  return (
    <Box>
      {description && <InvoiceComment description={description} />}
      <MenuRoot>
        <MenuTrigger asChild>
          <IconButton size="sm" variant="subtle" ml="0.25rem">
            <HiDotsHorizontal />
          </IconButton>
        </MenuTrigger>
        <MenuContent>
          {status === 'FINISHED' ? (
            <MenuItem value="mark-not-sent" onClick={markUnpaid}>
              <PiReceipt /> {l.invoice.markNotSent}
            </MenuItem>
          ) : (
            <>
              <MenuItem value="mark-sent" onClick={markPaid}>
                <PiReceipt />{' '}
                {status === RequestStatus.APPROVED
                  ? l.invoice.markSent
                  : l.invoice.approveMarkSent}
              </MenuItem>
              {status !== RequestStatus.APPROVED && (
                <MenuItem value="approve" onClick={approve}>
                  <HiCheck /> {l.invoice.approveSending}
                </MenuItem>
              )}
              {status !== RequestStatus.REJECTED && (
                <MenuItem value="deny" onClick={requestRevision}>
                  <HiXMark /> {l.economy.requestRevision}
                </MenuItem>
              )}
            </>
          )}
          <Separator my="0.25rem" />
          <MenuItem color="fg.error" value="delete" onClick={remove}>
            <HiTrash /> {l.general.delete}
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </Box>
  );
};

const InvoiceComment = ({ description }: { description: string }) => {
  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <IconButton size="sm" variant="subtle" ml="0.25rem">
          <PiChatFill />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>
          <PopoverTitle fontWeight="semibold">Comment</PopoverTitle>
          <Text my="4">{description}</Text>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};

const RequestStatusBadge = ({
  b,
  locale
}: {
  b: InvoiceStatus;
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);
  switch (b) {
    case RequestStatus.PENDING:
      return <Badge colorPalette="yellow">{l.invoice.status.pending}</Badge>;
    case RequestStatus.APPROVED:
      return <Badge colorPalette="yellow">{l.invoice.status.approved}</Badge>;
    case RequestStatus.REJECTED:
      return <Badge colorPalette="red">{l.invoice.status.rejected}</Badge>;
    case RequestStatus.PENDING_REVISED:
      return (
        <Badge colorPalette="yellow">{l.invoice.status.pendingRevised}</Badge>
      );
    case 'FINISHED':
      return <Badge colorPalette="green">{l.invoice.status.sent}</Badge>;
  }
};

const RequestStatusText = ({
  b,
  locale
}: {
  b: InvoiceStatus;
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);
  switch (b) {
    case RequestStatus.PENDING:
      return l.invoice.status.pending;
    case RequestStatus.APPROVED:
      return l.invoice.status.approved;
    case RequestStatus.REJECTED:
      return l.invoice.status.rejected;
    case RequestStatus.PENDING_REVISED:
      return l.invoice.status.pendingRevised;
    case 'FINISHED':
      return l.invoice.status.sent;
  }
};

export default InvoicesTable;
