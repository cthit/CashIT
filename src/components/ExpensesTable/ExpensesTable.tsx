'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import {
  markExpenseAsPaid,
  markExpenseAsUnpaid,
  deleteExpense,
  requestExpenseRevision,
  approveExpense
} from '@/actions/expenses';
import ExpenseService from '@/services/expenseService';
import {
  Badge,
  IconButton,
  Separator,
  Table,
  Text,
  LinkBox,
  LinkOverlay,
  Box
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
import { ExpenseType, RequestStatus } from '@prisma/client';
import { PiChatFill, PiCoins, PiPaperclip } from 'react-icons/pi';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import { EmptyState } from '../ui/empty-state';
import styles from './ExpensesTable.module.css';
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

const columnHelper = createColumnHelper<ExpenseRow>();

type Expense = Omit<
  Awaited<ReturnType<typeof ExpenseService.getPrettifiedForGroup>>[number],
  'user'
> & { user?: GammaUser };

type ExpenseStatus = RequestStatus | 'FINISHED';

interface ExpenseRow {
  id: number;
  description: string;
  group: string;
  groupId?: string;
  date: Date;
  type: ExpenseType;
  person: string;
  amount: number;
  status: ExpenseStatus;
  statusText: string;
  receipts: Expense['receipts'];
}

const ExpensesTable = ({
  e,
  groups,
  locale,
  treasurerPostId
}: {
  e: Expense[];
  groups: { group: GammaGroup; post: GammaPost }[];
  locale: string;
  treasurerPostId?: string;
}) => {
  const expenses = useMemo(() => {
    const groupsReverse = groups.reduce((acc, group) => {
      acc[group.group.id] = group;
      return acc;
    }, {} as Record<string, { group: GammaGroup; post: GammaPost }>);

    return e.map((expense) => {
      const status: ExpenseStatus =
        expense.paidAt !== null ? 'FINISHED' : expense.status;
      return {
        id: expense.id,
        description: expense.name,
        group: expense.gammaGroupId
          ? groupsReverse[expense.gammaGroupId]?.group.prettyName ?? 'No group'
          : 'No group',
        date: expense.createdAt,
        type: ExpenseTypeText({
          type: expense.type,
          locale
        }),
        person:
          expense.user?.firstName +
          ' "' +
          expense.user?.nick +
          '" ' +
          expense.user?.lastName,
        amount: expense.amount,
        status: status,
        statusText: RequestStatusText({ b: status, locale: locale }),
        receipts: expense.receipts,
        groupId: expense.gammaGroupId
      } as ExpenseRow;
    });
  }, [e, groups, locale]);

  const l = i18nService.getLocale(locale);

  const defaultColumns = [
    columnHelper.accessor('description', {
      header: l.general.description,
      cell: (info) => (
        <LinkOverlay
          as={Link}
          href={'/expenses/view?id=' + info.row.original.id}
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
    columnHelper.accessor('type', {
      header: l.expense.type,
      cell: (info) => info.getValue(),
      meta: {
        filterVariant: 'select'
      }
    }),
    columnHelper.accessor('person', {
      header: l.expense.person,
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor('amount', {
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
        const statusA = rowA.original.status as ExpenseStatus;
        const statusB = rowB.original.status as ExpenseStatus;
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
        const expense = info.row.original;
        const group = groups.find((g) => g.group.id === expense.groupId);
        return (
          <ExpenseActions
            {...expense}
            locale={locale}
            gammaGroup={group}
            treasurerPostId={treasurerPostId}
          />
        );
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
    data: expenses,
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
                    <TableFilter column={header.column} />
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
            icon={<PiCoins />}
            title={l.expense.listNotFound}
            description={l.expense.listNotFoundDesc}
          />
        </Table.Caption>
      )}
    </Table.Root>
  );
};

const ExpenseActions = ({
  id,
  status,
  description,
  receipts,
  locale,
  gammaGroup,
  treasurerPostId
}: ExpenseRow & {
  locale: string;
  gammaGroup?: { group: GammaGroup; post: GammaPost };
  treasurerPostId?: string;
}) => {
  const isTreasurer = gammaGroup?.post.id === treasurerPostId;
  const l = i18nService.getLocale(locale);
  const router = useRouter();

  const markUnpaid = useCallback(() => {
    markExpenseAsUnpaid(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  const markPaid = useCallback(() => {
    markExpenseAsPaid(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  const remove = useCallback(() => {
    deleteExpense(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  const approve = useCallback(() => {
    approveExpense(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  const requestRevision = useCallback(() => {
    requestExpenseRevision(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  return (
    <Box whiteSpace="pre">
      <ExpenseAttachments receipts={receipts} locale={locale} />
      {description && <ExpenseComment description={description} />}

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
            onClick={() => router.push('/expenses/view?id=' + id)}
          >
            {l.general.edit}
          </MenuItem>
          {isTreasurer && (
            <>
              <Separator my="0.25rem" />
              {/* FIXME: Link proper method and set proper labels */}
              <MenuItem value="forward" onClick={markPaid}>
                {status === RequestStatus.APPROVED
                  ? 'Forward'
                  : 'Approve and forward'}
              </MenuItem>
              {status === 'FINISHED' ? (
                <MenuItem value="mark-unpaid" onClick={markUnpaid}>
                  {l.expense.markUnpaid}
                </MenuItem>
              ) : (
                <>
                  <MenuItem value="mark-paid" onClick={markPaid}>
                    {status === RequestStatus.APPROVED
                      ? l.expense.markPaid
                      : l.expense.approveMarkPaid}
                  </MenuItem>
                  {status !== RequestStatus.APPROVED && (
                    <MenuItem value="approve" onClick={approve}>
                      {l.expense.approvePayment}
                    </MenuItem>
                  )}
                  {status !== RequestStatus.REJECTED && (
                    <MenuItem value="deny" onClick={requestRevision}>
                      {l.economy.requestRevision}
                    </MenuItem>
                  )}
                </>
              )}
              <Separator my="0.25rem" />
            </>
          )}
          <MenuItem color="fg.error" value="delete" onClick={remove}>
            {l.general.delete}
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </Box>
  );
};

const ExpenseComment = ({ description }: { description: string }) => {
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

const ExpenseAttachments = ({
  receipts,
  locale
}: {
  receipts: {
    id: number;
    sha256: string;
    name: string;
    media: {
      extension: string;
      createdAt: Date;
    };
  }[];
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);
  return (
    <PopoverRoot>
      <PopoverTrigger asChild>
        <IconButton size="sm" variant="subtle" ml="0.25rem">
          <PiPaperclip />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>
          <PopoverTitle fontWeight="semibold">
            {l.expense.receipts}
          </PopoverTitle>
          {receipts.map((receipt) => (
            <Text key={receipt.sha256} my="4">
              <Link
                href={`/api/media/${receipt.sha256}`}
                target="_blank"
                rel="noreferrer"
              >
                {receipt.name}
              </Link>
            </Text>
          ))}
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};

const RequestStatusBadge = ({
  b,
  locale
}: {
  b: ExpenseStatus;
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);
  switch (b) {
    case RequestStatus.PENDING:
      return <Badge colorPalette="gray">{l.requests.status.pending}</Badge>;
    case RequestStatus.APPROVED:
      return <Badge colorPalette="teal">{l.requests.status.approved}</Badge>;
    case RequestStatus.REJECTED:
      return <Badge colorPalette="red">{l.requests.status.rejected}</Badge>;
    case RequestStatus.PENDING_REVISED:
      return (
        <Badge colorPalette="yellow">{l.requests.status.pendingRevised}</Badge>
      );
    case 'FINISHED':
      return <Badge colorPalette="green">{l.requests.status.paid}</Badge>;
  }
};

const RequestStatusText = ({
  b,
  locale
}: {
  b: ExpenseStatus;
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);
  switch (b) {
    case RequestStatus.PENDING:
      return l.requests.status.pending;
    case RequestStatus.APPROVED:
      return l.requests.status.approved;
    case RequestStatus.REJECTED:
      return l.requests.status.rejected;
    case RequestStatus.PENDING_REVISED:
      return l.requests.status.pendingRevised;
    case 'FINISHED':
      return l.requests.status.paid;
  }
};

const ExpenseTypeText = ({
  type,
  locale
}: {
  type: ExpenseType;
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);
  switch (type) {
    case ExpenseType.EXPENSE:
      return l.expense.expenseType;
    case ExpenseType.INVOICE:
      return l.expense.invoiceType;
  }
};

export default ExpensesTable;
