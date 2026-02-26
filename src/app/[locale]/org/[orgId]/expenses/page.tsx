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
import { HiPlus } from 'react-icons/hi';
import GammaService from '@/services/gammaService';

export default async function Page(props: {
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { locale, orgId } = await props.params;
  const l = i18nService.getLocale(locale);

  const groups = await SessionService.getGroups();
  const superGroups = await GammaService.getAllSuperGroups();
  const orgIdNum = Number(orgId);
  const [divisionTreasurer, localAdmin] = await Promise.all([
    SessionService.isDivisionTreasurer(),
    SessionService.isOrgLocalAdmin(orgIdNum)
  ]);
  const isAdmin = divisionTreasurer || localAdmin;
  const expenses = await GammaService.includeUserInfo(
    await (isAdmin
      ? ExpenseService.getAll(Number(orgId))
      : SessionService.getExpenses(Number(orgId)))
  );

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href={`/org/${orgId}`}>
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.categories.expenses}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <Flex alignItems="center" justifyContent="space-between">
        <Heading as="h1" size="xl">
          {l.categories.expenses}
        </Heading>
        <Link href={`/org/${orgId}/expenses/create`}>
          <Button colorPalette="cyan">
            <HiPlus /> {l.expense.newTitle}
          </Button>
        </Link>
      </Flex>
      <Box p="2" />
      <ExpensesTable
        groups={groups}
        superGroups={superGroups}
        e={expenses}
        locale={locale}
        treasurerPostId={process.env.TREASURER_POST_ID}
        allEditable={isAdmin}
        orgId={orgIdNum}
      />
      <Box p="4" />
    </>
  );
}
