import { Box, Flex, Heading, Icon } from '@chakra-ui/react';
import NavigationLink from './NavigationLink/NavigationLink';
import i18nService from '@/services/i18nService';
import {
  PiBank,
  PiCashRegister,
  PiCoins,
  PiHouse,
  PiReceipt,
  PiUsersThree
} from 'react-icons/pi';

const Navigation = ({ locale }: { locale: string }) => {
  const l = i18nService.getLocale(locale);

  return (
    <Flex gap="0.25rem" direction="column">
      <NavigationLink href="/">
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

      <NavigationLink href="/expenses?show=all">
        <Icon size="md">
          <PiCoins />
        </Icon>{' '}
        {l.categories.expenses}
      </NavigationLink>
      <NavigationLink href="/invoices?show=all">
        <Icon size="md">
          <PiReceipt />
        </Icon>{' '}
        {l.categories.invoices}
      </NavigationLink>
      <NavigationLink href="/zettle-sales?show=all">
        <Icon size="md">
          <PiCashRegister />
        </Icon>{' '}
        {l.home.zettleSales}
      </NavigationLink>
      <NavigationLink href="/name-lists?show=all">
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

      <NavigationLink href="/bank-accounts">
        <Icon size="md">
          <PiBank />
        </Icon>{' '}
        {l.bankAccounts.title}
      </NavigationLink>
      <NavigationLink href="/receipt-creator">
        <Icon size="md">
          <PiReceipt />
        </Icon>{' '}
        {l.categories.receiptCreator}
      </NavigationLink>
    </Flex>
  );
};

export default Navigation;
