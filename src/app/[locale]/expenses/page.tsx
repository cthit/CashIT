import ExpenseService from '@/services/expenseService';
import SessionService from '@/services/sessionService';
import ExpensesTable from '@/components/ExpensesTable/ExpensesTable';
import Link from 'next/link';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import i18nService from '@/services/i18nService';

export default async function Page(props: {
  //searchParams: Promise<{ gid?: string; sgid?: string; }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const groups = await SessionService.getGroups();
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const expenses = await (divisionTreasurer
    ? ExpenseService.getAllPrettified()
    : SessionService.getExpenses());

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.categories.expenses}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <Flex alignItems="center" justifyContent="space-between">
        <Heading as="h1" size="xl">
          {l.categories.expenses}
        </Heading>
        <Link href={'/expenses/create'}>
          <Button colorPalette="cyan">{l.expense.newTitle}</Button>
        </Link>
      </Flex>
      <Box p="2" />
      <ExpensesTable
        groups={groups}
        e={expenses}
        locale={locale}
        treasurerPostId={process.env.TREASURER_POST_ID}
      />
      <Box p="4" />
    </>
  );
}
