import { Switch } from '@/components/ui/switch';
import i18nService from '@/services/i18nService';
import SessionService from '@/services/sessionService';
import { GammaGroup, GammaPost } from '@/types/gamma';
import {
  Badge,
  Box,
  Center,
  Flex,
  Grid,
  Heading,
  Icon,
  LinkBox,
  Separator,
  Text
} from '@chakra-ui/react';
import Link from 'next/link';
import {
  PiCashRegister,
  PiCoins,
  PiPlus,
  PiReceipt,
  PiUsersThree
} from 'react-icons/pi';
import './page.css';
import ExpenseService from '@/services/expenseService';
import InvoiceService from '@/services/invoiceService';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import { LiaUserAltSlashSolid } from 'react-icons/lia';

export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const groups = await SessionService.getGroupsWithPosts();
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const totalUnpaid = divisionTreasurer
    ? await ExpenseService.getUnpaidCount()
    : 0;
  const totalUnsent = divisionTreasurer
    ? await InvoiceService.getUnsentCount()
    : 0;

  return (
    <>
      <Flex alignContent="space-between" direction="row">
        <Box flexGrow="1">
          <Heading as="h1" size="xl" display="inline" mr="auto">
            {l.home.groups}
          </Heading>
          <Text color="fg.muted" textStyle="sm">
            {l.home.groupsDescription}
          </Text>
        </Box>
        <Switch size="md" color="fg.muted" id="showInactive">
          {l.home.showInactiveGroups}
        </Switch>
      </Flex>
      <Box p="1" />
      <Grid
        as="ul"
        gap="1rem"
        justifyContent="start"
        templateColumns="repeat( auto-fill, minmax(15rem, max-content) )"
      >
        <NavCard topLink="/groupless">
          <Icon size="2xl" mt="-0.6rem">
            <LiaUserAltSlashSolid />
          </Icon>

          <Heading size="lg" mt="1">
            {l.home.personal}
          </Heading>
          <Text textStyle="sm" color="fg.muted" mb="-0.6rem">
            {l.home.personalDescription}
          </Text>
        </NavCard>
        {groups.map((g) => (
          <GroupLink g={g} key={g.group.id} locale={locale} />
        ))}
      </Grid>
      {groups.length === 0 && <Text>Not member of any group</Text>}
      <Box p="2" />

      {divisionTreasurer && (
        <>
          <Heading as="h1" size="xl">
            {l.home.division}
          </Heading>
          <Text color="fg.muted" textStyle="sm">
            {l.home.divisionDescription}
          </Text>
          <Box p="1" />
          <Grid
            as="ul"
            gap="1rem"
            justifyContent="start"
            templateColumns="repeat( auto-fill, minmax(15rem, max-content) )"
          >
            <Box position="relative">
              {totalUnpaid > 0 && (
                <Badge
                  size="sm"
                  colorPalette="yellow"
                  position="absolute"
                  top="2"
                  right="2"
                  zIndex={2}
                  pointerEvents="none"
                >
                  {totalUnpaid}{' '}
                  {totalUnpaid > 1 ? l.economy.unpaidPlural : l.economy.unpaid}
                </Badge>
              )}
              <NavCard
                topLink="/expenses?show=all"
              >
                <Icon size="2xl">
                  <PiCoins />
                </Icon>

                <Heading size="lg" mt="2">
                  {l.home.groupExpenses}
                </Heading>
              </NavCard>
            </Box>

            <Box position="relative">
              {totalUnsent > 0 && (
                <Badge
                  size="sm"
                  colorPalette="yellow"
                  position="absolute"
                  top="2"
                  right="2"
                  zIndex={2}
                  pointerEvents="none"
                >
                  {totalUnsent}{' '}
                  {totalUnsent > 1 ? l.economy.unpaidPlural : l.economy.unpaid}
                </Badge>
              )}
              <NavCard
                topLink="/invoices?show=all"
              >
                <Icon size="2xl">
                  <PiReceipt />
                </Icon>
                <Heading size="lg" mt="2">
                  {l.home.groupInvoices}
                </Heading>
              </NavCard>
            </Box>

            <NavCard
              topLink={'/zettle-sales?show=all'}
            >
              <Icon size="2xl">
                <PiCashRegister />
              </Icon>
              <Heading size="lg" mt="2">
                {l.home.zettleSales}
              </Heading>
            </NavCard>

            <NavCard
              topLink={'/name-lists?show=all'}
            >
              <Icon size="2xl">
                <PiUsersThree />
              </Icon>
              <Heading size="lg" mt="2">
                {l.categories.nameLists}
              </Heading>
            </NavCard>
          </Grid>
        </>
      )}
    </>
  );
}

function GroupLink({
  g,
  locale
}: {
  g: {
    group: GammaGroup;
    post: GammaPost;
  };
  locale: string;
}) {
  const l = i18nService.getLocale(locale);

  const activeSuperGroup =
    g.group.superGroup.type === 'committee' ||
    g.group.superGroup.type === 'functionaries';
  const isTreasurer = g.post.id === 'cd6c2fc4-9fac-42e3-873c-6cfd71c3dd8d';

  const sgText = (
    <Flex
      p="0.5rem"
      pl="0.75rem"
      _hover={{ bg: activeSuperGroup && isTreasurer ? 'bg.subtle' : undefined }}
      bg={activeSuperGroup && isTreasurer ? undefined : 'bg.muted'}
      roundedBottom="md"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box>
        <Text textStyle="sm" mt="2" m="0" display="inline" mr="1">
          {g.group.superGroup.prettyName}
        </Text>
        <Text textStyle="sm" color="fg.muted" display="inline">
          {activeSuperGroup ? l.group.active : l.group.inactive}
        </Text>
      </Box>
      {activeSuperGroup && isTreasurer && <MdOutlineArrowForwardIos />}
    </Flex>
  );

  return (
    <LinkBox
      borderWidth="1px"
      rounded="md"
      className={activeSuperGroup ? undefined : 'inactiveGroup'}
    >
      <Link href={`/group?gid=${g.group.id}`}>
        <Flex
          p="0.5rem"
          pl="0.75rem"
          _hover={{ bg: 'bg.subtle' }}
          roundedTop="md"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Heading textStyle="lg">{g.group.prettyName}</Heading>
            <Text textStyle="sm" color="fg.muted">
              {isTreasurer ? l.group.treasurer : l.group.member}
            </Text>
          </Box>
          <MdOutlineArrowForwardIos />
        </Flex>
      </Link>
      <Separator />
      <Box width="20rem" />
      {activeSuperGroup && isTreasurer ? (
        <Link href={`/group?sgid=${g.group.superGroup.id}`}>{sgText}</Link>
      ) : (
        sgText
      )}
    </LinkBox>
  );
}

const NavCard = ({
  topLink,
  bottomLink,
  children,
  bottomChildren
}: {
  topLink: string;
  bottomLink?: string;
  children: React.ReactNode;
  bottomChildren?: React.ReactNode;
}) => {
  return (
    <LinkBox maxW="20rem" borderWidth="1px" rounded="md" position="relative">
      <Box width="20rem" />
      <Link href={topLink}>
        <Box
          py="5"
          _hover={{ bg: 'bg.subtle' }}
          rounded={bottomLink ? undefined : 'md'}
          roundedTop={bottomLink && 'md'}
        >
          <Flex alignItems="center" direction="column">
            {children}
          </Flex>
        </Box>
      </Link>

      {bottomLink && (
        <>
          <Separator />
          <Link href={bottomLink}>
            <Box _hover={{ bg: 'bg.subtle' }} roundedBottom="md" py="2">
              <Center>
                {bottomChildren ?? (
                  <Icon size="lg">
                    <PiPlus />
                  </Icon>
                )}
              </Center>
            </Box>
          </Link>
        </>
      )}
    </LinkBox>
  );
};
