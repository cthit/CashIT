'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import {
  markInvoiceAsSent,
  markInvoiceAsNotSent,
  deleteInvoice,
  requestInvoiceRevision,
  approveInvoice
} from '@/actions/invoices';
import {
  Badge,
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
import { PiChatFill, PiFileX } from 'react-icons/pi';
import InvoiceService from '@/services/invoiceService';
import { EmptyState } from '../ui/empty-state';
import Link from 'next/link';
import styles from './InvoicesTable.module.css';
import i18nService from '@/services/i18nService';
import { GammaUser } from '@/types/gamma';

type Invoice = Omit<
  Awaited<ReturnType<typeof InvoiceService.getPrettifiedForGroup>>[number],
  'user'
> & { user?: GammaUser };

const InvoicesTable = ({
  e,
  showGroups,
  personal,
  locale,
  isTreasurer
}: {
  e: Invoice[];
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
          <Table.ColumnHeader>{l.economy.name}</Table.ColumnHeader>
          {showGroups && (
            <Table.ColumnHeader>{l.expense.groupId}</Table.ColumnHeader>
          )}
          <Table.ColumnHeader>{l.economy.date}</Table.ColumnHeader>
          {!personal && (
            <Table.ColumnHeader>{l.expense.person}</Table.ColumnHeader>
          )}
          <Table.ColumnHeader>{l.economy.total}</Table.ColumnHeader>
          <Table.ColumnHeader>{l.expense.status}</Table.ColumnHeader>
          <Table.ColumnHeader />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {e.map((expense) => (
          <InvoiceRow
            {...expense}
            key={expense.id}
            showGroups={showGroups}
            personal={personal}
            isTreasurer={isTreasurer}
            locale={locale}
          />
        ))}
      </Table.Body>
      {e.length === 0 && (
        <Table.Caption>
          <EmptyState
            icon={<PiFileX />}
            title={l.invoice.listNotFound}
            description={l.invoice.listNotFoundDesc}
          />
        </Table.Caption>
      )}
    </Table.Root>
  );
};

const InvoiceRow = ({
  user,
  id,
  name,
  sentAt,
  status,
  createdAt,
  description,
  items,
  showGroups,
  personal,
  gammaGroupId,
  isTreasurer,
  locale
}: Invoice & {
  showGroups?: boolean;
  personal?: boolean;
  isTreasurer?: boolean;
  locale: string;
}) => {
  const router = useRouter();
  const total = InvoiceService.calculateSumForItems(items);
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
    <LinkBox as={Table.Row} _hover={{ bg: 'bg.subtle' }}>
      <Table.Cell>
        <LinkOverlay
          as={Link}
          href={'/invoices/view?id=' + id + (personal ? '&type=p' : '&type=g')}
          className={styles.overlay}
        >
          {name}
        </LinkOverlay>
      </Table.Cell>
      {showGroups && <Table.Cell>{gammaGroupId}</Table.Cell>}
      <Table.Cell>{i18nService.formatDate(createdAt, false)}</Table.Cell>
      {!personal && (
        <Table.Cell>
          {user?.firstName} &quot;{user?.nick}&quot; {user?.lastName}
        </Table.Cell>
      )}
      <Table.Cell>{total.toFixed(2)} kr</Table.Cell>
      <Table.Cell>
        {sentAt !== null ? (
          <Badge
            colorPalette="green"
            title={'Marked sent at ' + sentAt.toLocaleDateString()}
          >
            Sent
          </Badge>
        ) : (
          <RequestStatusBadge b={status} locale={locale} />
        )}
      </Table.Cell>
      <Table.Cell maxW="fit-content">
        {description && <InvoiceComment description={description} />}

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
                    '/invoices/view?id=' +
                    id
                )
              }
            >
              {l.general.edit}
            </MenuItem>
            {isTreasurer && (
              <>
                {sentAt !== null ? (
                  <MenuItem value="mark-not-sent" onClick={markUnpaid}>
                    {l.invoice.markNotSent}
                  </MenuItem>
                ) : (
                  <>
                    <MenuItem value="mark-sent" onClick={markPaid}>
                      {status === RequestStatus.APPROVED
                        ? l.invoice.markSent
                        : l.invoice.approveMarkSent}
                    </MenuItem>
                    {status !== RequestStatus.APPROVED && (
                      <MenuItem value="approve" onClick={approve}>
                        {l.invoice.approveSending}
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
  b: RequestStatus;
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
  }
};

export default InvoicesTable;
