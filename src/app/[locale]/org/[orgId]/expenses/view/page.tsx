import { notFound } from 'next/navigation';
import { Box, Fieldset, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import SessionService from '@/services/sessionService';
import Link from 'next/link';
import ExpenseService from '@/services/expenseService';
import i18nService from '@/services/i18nService';
import ForwardExpenseForm from './ForwardExpenseForm';
import OrgService from '@/services/orgService';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ExpenseType } from '@prisma/client';
import { LuCloud } from 'react-icons/lu';

export default async function Page(props: {
  searchParams: Promise<{ id?: string }>;
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const searchParams = await props.searchParams;
  const { locale, orgId } = await props.params;
  const l = i18nService.getLocale(locale);

  const { id } = searchParams;
  if (id === undefined) {
    notFound();
  }

  const expense = await ExpenseService.getById(+id);
  if (expense === null) {
    notFound();
  }
  const personal = expense.gammaGroupId === null;
  const isAdmin =
    (await SessionService.isDivisionTreasurer()) ||
    (await SessionService.isOrgLocalAdmin(Number(orgId)));

  const group =
    !personal && !isAdmin
      ? (await SessionService.getGroups()).find(
          (g) => g.group.id === expense.gammaGroupId
        )?.group
      : undefined;

  if (!personal && !isAdmin && group === undefined) {
    notFound();
  }

  const groups = (await SessionService.getGroups()).map((g) => g.group);

  const user = (await SessionService.getGammaUser())?.user;
  const canEdit = isAdmin || group || user?.id === expense.gammaUserId;

  const org = await OrgService.getById(Number(orgId));
  if (!org) {
    notFound();
  }

  const selectedGroup = expense.gammaGroupId
    ? groups.find((g) => g.id === expense.gammaGroupId)
    : null;

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href={`/org/${orgId}`}>
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href={`/org/${orgId}/expenses`}>
          {l.categories.expenses}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.general.view}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <Flex alignItems="center" gap="1">
        <Heading size="lg" flexGrow={1}>
          {l.expense.expense}
        </Heading>
        {canEdit && (
          <Button asChild colorPalette="cyan">
            <Link href={`/org/${orgId}/expenses/edit?id=${id}`}>
              {l.general.edit}
            </Link>
          </Button>
        )}
        <ForwardExpenseForm e={expense} locale={locale} />
      </Flex>
      <Box p="4" />
      <Fieldset.Root>
        <Fieldset.Content>
          <Field label={l.group.group}>
            <Text>
              {selectedGroup ? selectedGroup.prettyName : l.group.personal}
            </Text>
          </Field>

          <Field label={l.general.description}>
            <Text>{expense.name}</Text>
          </Field>

          <Field label={l.economy.date}>
            <Text>{expense.occurredAt.toLocaleDateString(locale)}</Text>
          </Field>

          <Field label={l.economy.amountTotal}>
            <Text>{expense.amount} kr</Text>
          </Field>

          <Field label={l.expense.type}>
            <Text>
              {expense.type === ExpenseType.EXPENSE
                ? l.expense.expense
                : l.expense.invoice}
            </Text>
          </Field>

          <Field label={l.general.comment}>
            <Text>{expense.description || l.general.none}</Text>
          </Field>

          <Field label={l.expense.receipts}>
            {expense.receipts.length > 0 ? (
              expense.receipts.map((file) => (
                <UploadedFile
                  key={file.id}
                  name={file.name}
                  sha256={file.sha256}
                />
              ))
            ) : (
              <Text>{l.general.none}</Text>
            )}
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </>
  );
}

const UploadedFile = ({ name, sha256 }: { name: string; sha256: string }) => {
  return (
    <Box
      display="flex"
      borderWidth="1px"
      rounded="md"
      p="4"
      w="100%"
      alignItems="center"
      gap="3"
    >
      <Icon fontSize="lg" color="fg.muted">
        <LuCloud />
      </Icon>

      <Text textStyle="sm" flex="1">
        <Link href={'/api/media/' + sha256} target="_blank">
          {name}
        </Link>
      </Text>
    </Box>
  );
};
