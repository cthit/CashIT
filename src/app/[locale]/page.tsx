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
import { PiPlus } from 'react-icons/pi';
import './page.css';
import ExpenseService from '@/services/expenseService';
import InvoiceService from '@/services/invoiceService';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import { LiaUserAltSlashSolid } from 'react-icons/lia';
import BankAccountService from '@/services/bankAccountService';
import BankAccountsCard from '@/components/BankAccountsCard/BankAccountsCard';

export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const allowedTypes = process.env.GROUP_TYPE_ALLOW_LIST?.split(',');
  const groups = allowedTypes
    ? (await SessionService.getGroupsWithPosts()).filter((t) =>
        allowedTypes.includes(t.group.superGroup.type)
      )
    : await SessionService.getGroupsWithPosts();
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const unpaid = divisionTreasurer ? await ExpenseService.getUnpaid() : [];
  const unsent = divisionTreasurer ? await InvoiceService.getUnsent() : [];

  const bankAccounts = divisionTreasurer
    ? await BankAccountService.getAll()
    : await SessionService.getBankAccounts();

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
      {groups.length === 0 && <Text>{l.home.groupsEmpty}</Text>}
      <Box p="2" />

      {(bankAccounts.length > 0 || divisionTreasurer) && (
        <>
          <Box>
            <Heading as="h1" size="xl" display="inline" mr="auto">
              {l.home.statistics}
            </Heading>
            <Text color="fg.muted" textStyle="sm">
              {l.home.statisticsDescription}
            </Text>
          </Box>
          <Box p="1" />

          <Flex as="ul" gap="1rem" justifyContent="start" flexWrap="wrap">
            {bankAccounts && (
              <BankAccountsCard
                accounts={bankAccounts}
                locale={locale}
                linkToControls={divisionTreasurer}
              />
            )}
            {divisionTreasurer && (
              <>
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  minW="15rem"
                  maxW="20rem"
                  height="max-content"
                >
                  <Link href="/expenses?show=all">
                    <Flex
                      justifyContent="space-between"
                      alignItems="center"
                      p="2"
                      _hover={{ bg: 'bg.subtle' }}
                      roundedTop="md"
                    >
                      <Box>
                        <Heading as="h1" size="xl" display="inline" mr="auto">
                          {l.categories.expenses}
                        </Heading>
                        <Text>
                          <Badge
                            size="sm"
                            colorPalette={unpaid.length > 0 ? 'yellow' : 'gray'}
                          >
                            {unpaid.length}{' '}
                            {unpaid.length === 1
                              ? l.economy.unpaid
                              : l.economy.unpaidPlural}
                          </Badge>
                        </Text>
                      </Box>
                      <MdOutlineArrowForwardIos />
                    </Flex>
                  </Link>
                  <Separator />
                  <Box p="2">
                    <Flex justifyContent="space-between">
                      <Text>{l.economy.total}</Text>
                      <Text>
                        {i18nService.formatNumber(
                          unpaid.reduce((a, b) => a + b.amount, 0)
                        )}
                      </Text>
                    </Flex>
                  </Box>
                </Box>
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  minW="15rem"
                  maxW="20rem"
                  height="max-content"
                >
                  <Link href="/invoices?show=all">
                    <Flex
                      justifyContent="space-between"
                      alignItems="center"
                      p="2"
                      _hover={{ bg: 'bg.subtle' }}
                      roundedTop="md"
                    >
                      <Box>
                        <Heading as="h1" size="xl" display="inline" mr="auto">
                          {l.categories.invoices}
                        </Heading>
                        <Text>
                          <Badge
                            size="sm"
                            colorPalette={unsent.length > 0 ? 'yellow' : 'gray'}
                          >
                            {unsent.length}{' '}
                            {unsent.length === 1
                              ? l.economy.unpaid
                              : l.economy.unpaidPlural}
                          </Badge>
                        </Text>
                      </Box>
                      <MdOutlineArrowForwardIos />
                    </Flex>
                  </Link>
                  <Separator />
                  <Box p="2">
                    <Flex justifyContent="space-between">
                      <Text>{l.economy.total}</Text>
                      <Text>
                        {i18nService.formatNumber(
                          unsent.reduce(
                            (a, b) =>
                              a + InvoiceService.calculateSumForItems(b.items),
                            0
                          )
                        )}
                      </Text>
                    </Flex>
                  </Box>
                </Box>
              </>
            )}
          </Flex>
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
