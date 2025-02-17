'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { IconButton, Table, LinkBox, LinkOverlay } from '@chakra-ui/react';
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

const ZettleSalesTable = ({
  e,
  showGroups,
  locale
}: {
  e: Awaited<ReturnType<typeof ZettleSaleService.getPrettifiedForGroup>>;
  showGroups?: boolean;
  locale: string;
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
          <Table.ColumnHeader>{l.expense.person}</Table.ColumnHeader>
          <Table.ColumnHeader>{l.expense.amount}</Table.ColumnHeader>
          <Table.ColumnHeader />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {e.map((expense) => (
          <SaleRow
            {...expense}
            key={expense.id}
            showGroups={showGroups}
            locale={locale}
          />
        ))}
      </Table.Body>
      {e.length === 0 && (
        <Table.Caption>
          <EmptyState
            icon={<PiCoins />}
            title={l.zettleSales.listNotFound}
            description={l.zettleSales.listNotFoundDesc}
          />
        </Table.Caption>
      )}
    </Table.Root>
  );
};

const SaleRow = ({
  user,
  id,
  name,
  amount,
  saleDate,
  gammaGroupId,
  showGroups,
  locale
}: Awaited<
  ReturnType<typeof ZettleSaleService.getPrettifiedForGroup>
>[number] & {
  showGroups?: boolean;
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);
  const router = useRouter();

  const remove = useCallback(() => {
    deleteZettleSale(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  return (
    <LinkBox as={Table.Row} _hover={{ bg: 'bg.subtle' }}>
      <Table.Cell>
        <LinkOverlay
          as={Link}
          href={'/zettle-sales/view?id=' + id}
          className={styles.overlay}
        >
          {name}
        </LinkOverlay>
      </Table.Cell>
      {showGroups && <Table.Cell>{gammaGroupId}</Table.Cell>}
      <Table.Cell>{i18nService.formatDate(saleDate, false)}</Table.Cell>
      <Table.Cell>
        {user.firstName} &quot;{user.nick}&quot; {user.lastName}
      </Table.Cell>
      <Table.Cell>{amount.toFixed(2)} kr</Table.Cell>
      <Table.Cell maxW="fit-content">
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
      </Table.Cell>
    </LinkBox>
  );
};

export default ZettleSalesTable;
