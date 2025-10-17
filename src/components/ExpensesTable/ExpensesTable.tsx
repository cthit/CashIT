'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import {
  markExpenseAsPaid,
  markExpenseAsUnpaid,
  deleteExpense,
  requestExpenseRevision,
  approveExpense,
  forwardExpenseToEmail
} from '@/actions/expenses';
import ExpenseService from '@/services/expenseService';
import {
  Badge,
  IconButton,
  Separator,
  Text,
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
import { HiCheck, HiDotsHorizontal } from 'react-icons/hi';
import { ExpenseType, RequestStatus } from '@prisma/client';
import { PiChatFill, PiCoins, PiPaperclip } from 'react-icons/pi';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import { EmptyState } from '../ui/empty-state';
import styles from './ExpensesTable.module.css';
import {
  GammaGroup,
  GammaPost,
  GammaUser,
  GammaSuperGroup,
  GammaGroupMember
} from '@/types/gamma';
import {
  createColumnHelper,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table';
import { initializeFilters } from '../TableFilter/TableFilter';
import {
  HiBanknotes,
  HiPaperAirplane,
  HiTrash,
  HiXMark
} from 'react-icons/hi2';
import CashitTable from '../CashitTable/CashitTable';

const columnHelper = createColumnHelper<ExpenseRow>();

type Expense = Awaited<
  ReturnType<typeof ExpenseService.getForGroup>
>[number] & { user?: GammaUser };

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

const cellWidths: Record<string, string> = {
  actions: '9rem',
  amount: '8rem',
  type: '8rem',
  date: '8rem',
  description: '20%'
};

const ExpensesTable = ({
  e,
  groups,
  locale,
  treasurerPostId,
  allEditable = false,
  superGroups
}: {
  e: Expense[];
  groups: { group: GammaGroup; post: GammaPost }[];
  locale: string;
  treasurerPostId?: string;
  allEditable?: boolean;
  superGroups?: { superGroup: GammaSuperGroup; members: GammaGroupMember[] }[];
}) => {
  const l = i18nService.getLocale(locale);

  const expenses = useMemo(() => {
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

    return e.map((expense) => {
      const status: ExpenseStatus =
        expense.paidAt !== null ? 'FINISHED' : expense.status;
      return {
        id: expense.id,
        description: expense.name,
        group: getGroupDisplayName(expense.gammaSuperGroupId),
        date: expense.createdAt,
        type: ExpenseTypeText({
          type: expense.type,
          locale
        }),
        person: expense.user?.firstName + ' ' + expense.user?.lastName,
        amount: expense.amount,
        status: status,
        statusText: RequestStatusText({ b: status, locale: locale }),
        receipts: expense.receipts,
        groupId: expense.gammaGroupId
      } as ExpenseRow;
    });
  }, [superGroups, e, l.group.noGroup, l.group.unknownGroup, locale]);

  const defaultColumns = useMemo(
    () => [
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
        filterFn: 'arrIncludesSome',
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
        filterFn: 'arrIncludesSome',
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
          filterVariant: 'select',
          defaultExcludeSelect: [l.requests.status.paid]
        },
        filterFn: 'arrIncludesSome',
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
              editable={allEditable}
            />
          );
        }
      })
    ],
    [
      l.general.description,
      l.expense.group,
      l.expense.date,
      l.expense.type,
      l.expense.person,
      l.expense.amount,
      l.expense.status,
      l.requests.status.paid,
      locale,
      groups,
      treasurerPostId,
      allEditable
    ]
  );

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

  const [columnFilters, setColumnFilters] = useState(() =>
    initializeFilters(defaultColumns, expenses)
  );

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
      cellWidths={cellWidths}
      locale={locale}
      emptyStateComponent={
        <EmptyState
          icon={<PiCoins />}
          title={l.expense.listNotFound}
          description={l.expense.listNotFoundDesc}
        />
      }
    />
  );
};

const ExpenseActions = ({
  id,
  status,
  description,
  receipts,
  locale,
  gammaGroup,
  treasurerPostId,
  editable = false
}: ExpenseRow & {
  locale: string;
  gammaGroup?: { group: GammaGroup; post: GammaPost };
  treasurerPostId?: string;
  editable?: boolean;
}) => {
  const isTreasurer = editable || gammaGroup?.post.id === treasurerPostId;
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

  const approveForward = useCallback(() => {
    approveExpense(id)
      .then(() => forwardExpenseToEmail(id))
      .then(() => {
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
          {isTreasurer && (
            <>
              <MenuItem value="forward" onClick={approveForward}>
                <HiPaperAirplane />
                {status === 'FINISHED'
                  ? l.expense.forward
                  : l.expense.approveForward}
              </MenuItem>
              {status === 'FINISHED' ? (
                <MenuItem value="mark-unpaid" onClick={markUnpaid}>
                  <HiBanknotes /> {l.expense.markUnpaid}
                </MenuItem>
              ) : (
                <>
                  <MenuItem value="mark-paid" onClick={markPaid}>
                    <HiBanknotes />{' '}
                    {status === RequestStatus.APPROVED
                      ? l.expense.markPaid
                      : l.expense.approveMarkPaid}
                  </MenuItem>
                  {status !== RequestStatus.APPROVED && (
                    <MenuItem value="approve" onClick={approve}>
                      <HiCheck /> {l.expense.approvePayment}
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
            </>
          )}
          <MenuItem color="fg.error" value="delete" onClick={remove}>
            <HiTrash /> {l.general.delete}
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
