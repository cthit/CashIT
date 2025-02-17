import { notFound } from 'next/navigation';
import { Box } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import SessionService from '@/services/sessionService';
import Link from 'next/link';
import CreateExpenseForm from '../create/CreateExpenseForm';
import ExpenseService from '@/services/expenseService';
import i18nService from '@/services/i18nService';

export default async function Page(props: {
  searchParams: Promise<{ id?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const searchParams = await props.searchParams;
  const { locale } = await props.params;
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
  const divisionTreasurer = await SessionService.isDivisionTreasurer();

  const group =
    !personal && !divisionTreasurer
      ? (await SessionService.getGroups()).find(
          (g) => g.group.id === expense.gammaGroupId
        )?.group
      : undefined;

  if (!personal && !divisionTreasurer && group === undefined) {
    notFound();
  }

  const user = (await SessionService.getGammaUser())?.user;
  const canEdit =
    divisionTreasurer || group || user?.id === expense.gammaUserId;

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        {group ? (
          <BreadcrumbLink
            as={Link}
            href={
              '/group' +
              (expense.gammaGroupId ? '?gid=' + expense.gammaGroupId : '')
            }
          >
            {group.prettyName}
          </BreadcrumbLink>
        ) : (
          <BreadcrumbLink as={Link} href="/groupless">
            {l.home.personal}
          </BreadcrumbLink>
        )}
        <BreadcrumbLink
          as={Link}
          href={
            '/expenses' +
            (expense.gammaGroupId ? '?gid=' + expense.gammaGroupId : '')
          }
        >
          {l.categories.expenses}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.general.edit}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <CreateExpenseForm
        gid={expense.gammaGroupId ?? undefined}
        e={expense}
        locale={locale}
        readOnly={!canEdit}
      />
    </>
  );
}
