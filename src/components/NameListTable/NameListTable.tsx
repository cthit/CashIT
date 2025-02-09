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
import { PiUserList } from 'react-icons/pi';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import { EmptyState } from '../ui/empty-state';
import styles from './NameListTable.module.css';
import NameListService from '@/services/nameListService';
import { deleteNameList } from '@/actions/nameLists';
import { NameListType } from '@prisma/client';
import { GammaUser } from '@/types/gamma';

type NameList = Omit<
  Awaited<ReturnType<typeof NameListService.getPrettifiedForGroup>>[number],
  'user'
> & { user?: GammaUser };

const NameListTable = ({
  e,
  showGroups,
  personal,
  locale
}: {
  e: NameList[];
  showGroups?: boolean;
  personal?: boolean;
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>{l.expense.name}</Table.ColumnHeader>
          {showGroups && (
            <Table.ColumnHeader>{l.expense.groupId}</Table.ColumnHeader>
          )}
          <Table.ColumnHeader>{l.expense.date}</Table.ColumnHeader>
          {!personal && (
            <Table.ColumnHeader>{l.expense.person}</Table.ColumnHeader>
          )}
          <Table.ColumnHeader>{l.nameLists.tracked}</Table.ColumnHeader>
          <Table.ColumnHeader>{l.nameLists.people}</Table.ColumnHeader>
          <Table.ColumnHeader>{l.expense.type}</Table.ColumnHeader>
          <Table.ColumnHeader />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {e.map((expense) => (
          <NameListRow
            {...expense}
            key={expense.id}
            showGroups={showGroups}
            locale={locale}
            personal={personal}
          />
        ))}
      </Table.Body>
      {e.length === 0 && (
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

const NameListRow = ({
  user,
  id,
  name,
  gammaGroupId,
  showGroups,
  locale,
  names,
  tracked,
  gammaNames,
  type,
  occurredAt,
  personal
}: NameList & {
  showGroups?: boolean;
  locale: string;
  personal?: boolean;
}) => {
  const l = i18nService.getLocale(locale);
  const count = names.length + gammaNames.length;
  const router = useRouter();

  const remove = useCallback(() => {
    deleteNameList(id).then(() => {
      router.refresh();
    });
  }, [id, router]);

  return (
    <LinkBox as={Table.Row} _hover={{ bg: 'bg.subtle' }}>
      <Table.Cell>
        <LinkOverlay
          as={Link}
          href={
            '/name-lists/view?id=' + id + (personal ? '&type=p' : '&type=g')
          }
          className={styles.overlay}
        >
          {name}
        </LinkOverlay>
      </Table.Cell>
      {showGroups && <Table.Cell>{gammaGroupId}</Table.Cell>}
      <Table.Cell>
        {occurredAt && i18nService.formatDate(occurredAt, false)}
      </Table.Cell>
      {!personal && (
        <Table.Cell>
          {user?.firstName} &quot;{user?.nick}&quot; {user?.lastName}
        </Table.Cell>
      )}
      <Table.Cell>{tracked ? 'Yes' : 'No'}</Table.Cell>
      <Table.Cell>{count}</Table.Cell>
      <Table.Cell>
        <ListTypeText type={type} locale={locale} />
      </Table.Cell>
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
              onClick={() =>
                router.push(
                  '/name-lists/view?id=' +
                    id +
                    (personal ? '&type=p' : '&type=g')
                )
              }
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
