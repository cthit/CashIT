'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { deleteOrganization } from '@/actions/organizations';
import {
  Badge,
  IconButton,
  Text,
  Box,
  Table
} from '@chakra-ui/react';
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger
} from '@/components/ui/menu';
import { HiDotsHorizontal, HiPencil, HiTrash } from 'react-icons/hi';
import i18nService from '@/services/i18nService';
import { Organization } from '@prisma/client';

const OrganizationsTable = ({
  organizations,
  locale
}: {
  organizations: Organization[];
  locale: string;
}) => {
  const router = useRouter();

  const handleRowClick = (orgId: number, e: React.MouseEvent) => {
    // Don't navigate if clicking on the actions menu
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menuitem"]')) {
      return;
    }
    router.push(`/admin/organizations/${orgId}`);
  };

  if (organizations.length === 0) {
    return (
      <Box p={8} textAlign="center" borderWidth="1px" rounded="md">
        <Text fontSize="lg" color="fg.muted">
          No organizations found
        </Text>
        <Text fontSize="sm" color="fg.muted" mt={2}>
          Create your first organization to get started
        </Text>
      </Box>
    );
  }

  return (
    <Box borderWidth="1px" rounded="md" overflow="hidden">
      <Table.Root variant="outline" interactive>
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Created</Table.ColumnHeader>
            <Table.ColumnHeader>Updated</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {organizations.map((org) => (
            <Table.Row
              key={org.id}
              onClick={(e) => handleRowClick(org.id, e)}
              cursor="pointer"
              _hover={{ bg: 'bg.muted' }}
            >
              <Table.Cell>
                <Badge>{org.id}</Badge>
              </Table.Cell>
              <Table.Cell>
                <Text fontWeight="medium">{org.name}</Text>
              </Table.Cell>
              <Table.Cell>
                {new Date(org.createdAt).toLocaleDateString(locale)}
              </Table.Cell>
              <Table.Cell>
                {new Date(org.updatedAt).toLocaleDateString(locale)}
              </Table.Cell>
              <Table.Cell textAlign="right">
                <OrgActions id={org.id} name={org.name} locale={locale} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

const OrgActions = ({
  id,
  name,
  locale
}: {
  id: number;
  name: string;
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);
  const router = useRouter();

  const handleDelete = useCallback(() => {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      deleteOrganization(id).then(() => {
        router.refresh();
      });
    }
  }, [id, name, router]);

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton size="sm" variant="subtle">
          <HiDotsHorizontal />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <MenuItem
          value="edit"
          cursor="pointer"
          onClick={() => router.push(`/admin/organizations/${id}/edit`)}
        >
          <HiPencil /> {l.general.edit}
        </MenuItem>
        <MenuItem
          value="delete"
          color="fg.error"
          cursor="pointer"
          onClick={handleDelete}
        >
          <HiTrash /> {l.general.delete}
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
};

export default OrganizationsTable;
