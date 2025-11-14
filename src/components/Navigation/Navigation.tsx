import { Box, Flex, Heading, Icon } from '@chakra-ui/react';
import NavigationLink from './NavigationLink/NavigationLink';
import i18nService from '@/services/i18nService';
import {
  PiBank,
  PiCashRegister,
  PiCoins,
  PiHouse,
  PiReceipt,
  PiUsersThree,
  PiGear
} from 'react-icons/pi';
import SessionService from '@/services/sessionService';

const Navigation = async ({ locale, orgId = 1 }: { locale: string; orgId?: number }) => {
  const l = i18nService.getLocale(locale);
  const divisionTreasurer = await SessionService.isDivisionTreasurer();

  return (
    <Flex gap="0.25rem" direction="column">
      <NavigationLink href={`/org/${orgId}`}>
        <Icon size="md">
          <PiHouse />
        </Icon>{' '}
        {l.home.title}
      </NavigationLink>

      <Box>
        <Heading as="h1" size="xl" mt="4" mb="0">
          {l.categories.accounting}
        </Heading>
      </Box>

      <NavigationLink href={`/org/${orgId}/expenses`}>
        <Icon size="md">
          <PiCoins />
        </Icon>{' '}
        {l.categories.expenses}
      </NavigationLink>
      <NavigationLink href={`/org/${orgId}/invoices`}>
        <Icon size="md">
          <PiReceipt />
        </Icon>{' '}
        {l.categories.invoices}
      </NavigationLink>
      <NavigationLink href={`/org/${orgId}/zettle-sales`}>
        <Icon size="md">
          <PiCashRegister />
        </Icon>{' '}
        {l.home.zettleSales}
      </NavigationLink>
      <NavigationLink href={`/org/${orgId}/name-lists`}>
        <Icon size="md">
          <PiUsersThree />
        </Icon>{' '}
        {l.categories.nameLists}
      </NavigationLink>

      <Box>
        <Heading as="h1" size="xl" mt="4" mb="0">
          {l.categories.tools}
        </Heading>
      </Box>

      {divisionTreasurer && (
        <NavigationLink href={`/org/${orgId}/bank-accounts`}>
          <Icon size="md">
            <PiBank />
          </Icon>{' '}
          {l.bankAccounts.title}
        </NavigationLink>
      )}
      <NavigationLink href={`/org/${orgId}/receipt-creator`}>
        <Icon size="md">
          <PiReceipt />
        </Icon>{' '}
        {l.categories.receiptCreator}
      </NavigationLink>

      {divisionTreasurer && (
        <>
          <Box>
            <Heading as="h1" size="xl" mt="4" mb="0">
              Admin
            </Heading>
          </Box>
          <NavigationLink href={`/admin/organizations`}>
            <Icon size="md">
              <PiGear />
            </Icon>{' '}
            Organizations
          </NavigationLink>
        </>
      )}
    </Flex>
  );
};

export default Navigation;
