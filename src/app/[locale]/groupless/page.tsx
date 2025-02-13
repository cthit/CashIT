import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import i18nService from '@/services/i18nService';
import {
  Box,
  Center,
  Flex,
  Grid,
  Heading,
  Icon,
  LinkBox,
  Separator
} from '@chakra-ui/react';
import Link from 'next/link';
import { PiCoins, PiPlus, PiReceipt, PiUsersThree } from 'react-icons/pi';

export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.home.personal}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <Grid
        as="ul"
        gap="1rem"
        justifyContent="start"
        templateColumns="repeat( auto-fill, minmax(15rem, max-content) )"
      >
        <NavCard topLink="/expenses" bottomLink="/expenses/create">
          <Icon size="2xl">
            <PiCoins />
          </Icon>
          <Heading size="lg" mt="2">
            {l.categories.expenses}
          </Heading>
        </NavCard>
        <NavCard topLink="/invoices" bottomLink="/invoices/create">
          <Icon size="2xl">
            <PiReceipt />
          </Icon>
          <Heading size="lg" mt="2">
            {l.categories.invoices}
          </Heading>
        </NavCard>
        <NavCard topLink={'/name-lists'} bottomLink={'/name-lists/create'}>
          <Icon size="2xl">
            <PiUsersThree />
          </Icon>
          <Heading size="lg" mt="2">
            {l.categories.nameLists}
          </Heading>
        </NavCard>
      </Grid>
    </>
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
