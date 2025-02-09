import ExpenseService from '@/services/expenseService';
import { notFound } from 'next/navigation';
import SessionService from '@/services/sessionService';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import {
  Badge,
  Box,
  Center,
  Flex,
  Grid,
  Heading,
  Icon,
  LinkBox,
  Separator
} from '@chakra-ui/react';
import {
  PiCashRegister,
  PiCoins,
  PiPlus,
  PiReceipt,
  PiUsersThree
} from 'react-icons/pi';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import InvoiceService from '@/services/invoiceService';

export default async function Page(props: {
  searchParams: Promise<{ gid?: string; sgid?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const { gid, sgid } = await props.searchParams;

  if (gid === undefined && sgid === undefined) {
    notFound();
  }
  const useSuperGroup = gid === undefined;
  const id = useSuperGroup ? sgid : gid;
  const idParam = useSuperGroup ? 'sgid=' + sgid : 'gid=' + gid;

  const group = useSuperGroup
    ? (await SessionService.getSuperGroups()).find((g) => g.group.id === id)
        ?.group
    : (await SessionService.getGroups()).find((g) => g.group.id === id)?.group;
  if (group === undefined) {
    notFound();
  }

  const isTreasurer = await SessionService.isTreasurerInGroup(group.id);

  const unpaidExpensesCount = (
    useSuperGroup
      ? await ExpenseService.getForSuperGroup(id!)
      : await ExpenseService.getForGroup(id!)
  ).filter((e) => e.paidAt === null).length;

  const notSentInvoicesCount = (
    useSuperGroup
      ? await InvoiceService.getForSuperGroup(id!)
      : await InvoiceService.getForGroup(id!)
  ).filter((i) => i.sentAt === null).length;

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{group.prettyName}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />

      <Grid
        gridGap="1rem"
        templateColumns="repeat( auto-fit, minmax(15rem, max-content) )"
      >
        <NavCard
          topLink={`/name-lists?${idParam}`}
          bottomLink={gid && `/name-lists/create?${idParam}`}
        >
          <Icon size="2xl">
            <PiUsersThree />
          </Icon>
          <Heading size="lg" mt="2">
            {l.categories.nameLists}
          </Heading>
        </NavCard>

        <NavCard
          topLink={`/expenses?${idParam}`}
          bottomLink={gid && `/expenses/create?${idParam}`}
        >
          <Icon size="2xl">
            <PiCoins />
          </Icon>
          {unpaidExpensesCount > 0 && (
            <Badge
              size="sm"
              colorPalette="yellow"
              position="absolute"
              top="2"
              right="2"
            >
              {unpaidExpensesCount}{' '}
              {unpaidExpensesCount > 1
                ? l.economy.unpaidPlural
                : l.economy.unpaid}
            </Badge>
          )}
          <Heading size="lg" mt="2">
            {l.categories.expenses}
          </Heading>
        </NavCard>

        <NavCard
          topLink={`/invoices?${idParam}`}
          bottomLink={gid && `/invoices/create?${idParam}`}
          bottomDisabled={!isTreasurer}
        >
          <Icon size="2xl">
            <PiReceipt />
          </Icon>
          {notSentInvoicesCount > 0 && (
            <Badge
              size="sm"
              colorPalette="yellow"
              position="absolute"
              top="2"
              right="2"
            >
              {notSentInvoicesCount}{' '}
              {notSentInvoicesCount > 1
                ? l.economy.notSentPlural
                : l.economy.notSent}
            </Badge>
          )}
          <Heading size="lg" mt="2">
            {l.categories.invoices}
          </Heading>
        </NavCard>

        <NavCard
          topLink={`/zettle-sales?${idParam}`}
          bottomLink={gid && `/zettle-sales/create?${idParam}`}
          bottomDisabled={!isTreasurer}
        >
          <Icon size="2xl">
            <PiCashRegister />
          </Icon>
          <Heading size="lg" mt="2">
            {l.home.zettleSales}
          </Heading>
        </NavCard>
      </Grid>
    </>
  );
}

const NavCard = ({
  topLink,
  bottomLink,
  bottomDisabled,
  children
}: {
  topLink: string;
  bottomLink?: string;
  bottomDisabled?: boolean;
  children: React.ReactNode;
}) => {
  const bottomContent = (
    <Box
      _hover={{ bg: bottomDisabled ? undefined : 'bg.subtle' }}
      bg={bottomDisabled ? 'bg.muted' : undefined}
      roundedBottom="md"
      py="2"
    >
      <Center>
        <Icon size="lg" color={bottomDisabled ? 'fg.muted' : undefined}>
          <PiPlus />
        </Icon>
      </Center>
    </Box>
  );
  return (
    <LinkBox maxW="20rem" borderWidth="1px" rounded="md">
      <Box width="20rem" />
      <Link href={topLink}>
        <Box
          py="5"
          _hover={{ bg: 'bg.subtle' }}
          rounded={bottomLink ? undefined : 'md'}
          roundedTop={bottomLink && 'md'}
          position="relative"
        >
          <Flex alignItems="center" direction="column">
            {children}
          </Flex>
        </Box>
      </Link>

      {bottomLink && (
        <>
          <Separator />
          {!bottomDisabled ? (
            <Link href={bottomLink}>{bottomContent}</Link>
          ) : (
            bottomContent
          )}
        </>
      )}
    </LinkBox>
  );
};
