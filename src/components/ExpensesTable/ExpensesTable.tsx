'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
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
  LinkOverlay
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
import { GammaUser } from '@/types/gamma';

type Expense = Omit<
  Awaited<ReturnType<typeof ExpenseService.getPrettifiedForGroup>>[number],
  'user'
> & { user?: GammaUser };

const ExpensesTable = ({
  e,
  showGroups,
  personal,
  locale,
  isTreasurer
}: {
  e: Expense[];
  showGroups?: boolean;
  personal?: boolean;
  locale: string;
  isTreasurer?: boolean;
}) => {
  const l = i18nService.getLocale(locale);

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>{l.general.description}</Table.ColumnHeader>
          {showGroups && (
            <Table.ColumnHeader>{l.expense.groupId}</Table.ColumnHeader>
          )}
          <Table.ColumnHeader>{l.expense.date}</Table.ColumnHeader>
          <Table.ColumnHeader>{l.expense.type}</Table.ColumnHeader>
          {!personal && (
            <Table.ColumnHeader>{l.expense.person}</Table.ColumnHeader>
          )}
          <Table.ColumnHeader>{l.expense.amount}</Table.ColumnHeader>
          <Table.ColumnHeader>{l.expense.status}</Table.ColumnHeader>
          <Table.ColumnHeader />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {e.map((expense) => (
          <ExpenseRow
            {...expense}
            key={expense.id}
            showGroups={showGroups}
            personal={personal}
            locale={locale}
            isTreasurer={isTreasurer}
          />
        ))}
      </Table.Body>
      {e.length === 0 && (
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

const ExpenseRow = ({
  user,
  id,
  name,
  amount,
  paidAt,
  status,
  createdAt,
  description,
  receipts,
  gammaGroupId,
  showGroups,
  personal,
  locale,
  type,
  isTreasurer
}: Expense & {
  showGroups?: boolean;
  personal?: boolean;
  locale: string;
  isTreasurer?: boolean;
}) => {
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
    <LinkBox as={Table.Row} _hover={{ bg: 'bg.subtle' }}>
      <Table.Cell>
        <LinkOverlay
          as={Link}
          href={'/expenses/view?id=' + id + (personal ? '&type=p' : '&type=g')}
          className={styles.overlay}
        >
          {name}
        </LinkOverlay>
      </Table.Cell>
      {showGroups && <Table.Cell>{gammaGroupId}</Table.Cell>}
      <Table.Cell>{i18nService.formatDate(createdAt, false)}</Table.Cell>
      <Table.Cell>
        <ExpenseTypeText type={type} locale={locale} />
      </Table.Cell>
      {!personal && (
        <Table.Cell>
          {user?.firstName} &quot;{user?.nick}&quot; {user?.lastName}
        </Table.Cell>
      )}
      <Table.Cell>{amount.toFixed(2)} kr</Table.Cell>
      <Table.Cell>
        {paidAt !== null ? (
          <Badge
            colorPalette="green"
            title={l.requests.status.paidAt + paidAt.toLocaleDateString()}
          >
            {l.requests.status.paid}
          </Badge>
        ) : (
          <RequestStatusBadge b={status} locale={locale} />
        )}
      </Table.Cell>
      <Table.Cell maxW="fit-content">
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
              onClick={() =>
                router.push(
                  (personal ? '/personal' : '/group') +
                    '/expenses/view?id=' +
                    id
                )
              }
            >
              {l.general.edit}
            </MenuItem>
            {isTreasurer && (
              <>
                <Separator my="0.25rem" />
                {paidAt !== null ? (
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
      </Table.Cell>
    </LinkBox>
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
  b: RequestStatus;
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
