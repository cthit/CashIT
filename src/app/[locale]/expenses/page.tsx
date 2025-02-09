import ExpenseService from '@/services/expenseService';
import { notFound } from 'next/navigation';
import SessionService from '@/services/sessionService';
import ExpensesTable from '@/components/ExpensesTable/ExpensesTable';
import Link from 'next/link';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import { Box } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import i18nService from '@/services/i18nService';

export default async function Page(props: {
  searchParams: Promise<{ gid?: string; sgid?: string; show?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const { gid, sgid, show } = await props.searchParams;
  const useSuperGroup = !gid;
  const personal = !gid && !sgid;
  const id = personal ? undefined : useSuperGroup ? sgid : gid;
  const idParam = personal
    ? undefined
    : `${useSuperGroup ? 'sgid' : 'gid'}=${id}`;

  const groups = await (useSuperGroup
    ? SessionService.getSuperGroups()
    : SessionService.getGroups());
  const group = groups.find((g) => g.group.id === id)?.group;

  if (!personal && !group) notFound();

  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const fetchAll = show === 'all' && divisionTreasurer;

  const isTreasurer = personal
    ? false
    : await SessionService.isTreasurerInGroup(group!.id);
  const expenses = fetchAll
    ? await ExpenseService.getAllPrettified()
    : personal
    ? await SessionService.getExpenses()
    : useSuperGroup
    ? await ExpenseService.getPrettifiedForSuperGroup(sgid!)
    : await ExpenseService.getPrettifiedForGroup(gid!);

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        {group && (
          <BreadcrumbLink as={Link} href={'/group?' + idParam}>
            {group.prettyName}
          </BreadcrumbLink>
        )}
        <BreadcrumbCurrentLink>{l.categories.expenses}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <ExpensesTable
        e={expenses}
        showGroups={!personal && useSuperGroup}
        locale={locale}
        isTreasurer={isTreasurer || divisionTreasurer}
      />
      <Box p="4" />
      {(personal || !useSuperGroup) && (
        <Link href={'/expenses/create' + (personal ? '' : '?gid=' + gid)}>
          <Button variant="surface">{l.expense.newTitle}</Button>
        </Link>
      )}
    </>
  );
}
