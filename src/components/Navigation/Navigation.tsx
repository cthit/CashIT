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
  PiGear,
  PiEnvelope
} from 'react-icons/pi';
import SessionService from '@/services/sessionService';
import OrganizationSelector from './OrganizationSelector';
import OrgService from '@/services/orgService';

const Navigation = async ({
  locale,
  orgId,
  inDrawer = false
}: {
  locale: string;
  orgId?: number;
  inDrawer?: boolean;
}) => {
  const l = i18nService.getLocale(locale);
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const organizations = await OrgService.getAll();

  const orgLocalAdmin = orgId !== undefined
    ? await SessionService.isOrgLocalAdmin(orgId)
    : false;

  const orgPrefix = orgId !== undefined ? `/org/${orgId}` : '/';

  return (
    <Flex justifyContent="space-between" height="100%" direction="column">
      <Flex
        gap="0.25rem"
        direction="column"
        overflowY="auto"
        p={inDrawer ? 0 : 4}
      >
        <NavigationLink href={orgPrefix}>
          <Icon size="md">
            <PiHouse />
          </Icon>{' '}
          {l.home.title}
        </NavigationLink>

        {orgId !== undefined && (
          <>
            <Box>
              <Heading as="h1" size="xl" mt="4" mb="0">
                {l.categories.accounting}
              </Heading>
            </Box>

            <NavigationLink href={`${orgPrefix}/expenses`}>
              <Icon size="md">
                <PiCoins />
              </Icon>{' '}
              {l.categories.expenses}
            </NavigationLink>
            <NavigationLink href={`${orgPrefix}/invoices`}>
              <Icon size="md">
                <PiReceipt />
              </Icon>{' '}
              {l.categories.invoices}
            </NavigationLink>
            <NavigationLink href={`${orgPrefix}/zettle-sales`}>
              <Icon size="md">
                <PiCashRegister />
              </Icon>{' '}
              {l.home.zettleSales}
            </NavigationLink>
            <NavigationLink href={`${orgPrefix}/name-lists`}>
              <Icon size="md">
                <PiUsersThree />
              </Icon>{' '}
              {l.categories.nameLists}
            </NavigationLink>
          </>
        )}

        {orgId !== undefined && (
          <>
            <Box>
              <Heading as="h1" size="xl" mt="4" mb="0">
                {l.categories.tools}
              </Heading>
            </Box>

            {divisionTreasurer && (
              <NavigationLink href={`${orgPrefix}/bank-accounts`}>
                <Icon size="md">
                  <PiBank />
                </Icon>{' '}
                {l.bankAccounts.title}
              </NavigationLink>
            )}
            <NavigationLink href={`${orgPrefix}/receipt-creator`}>
              <Icon size="md">
                <PiReceipt />
              </Icon>{' '}
              {l.categories.receiptCreator}
            </NavigationLink>
            {(divisionTreasurer || orgLocalAdmin) && (
              <NavigationLink href={`${orgPrefix}/settings`}>
                <Icon size="md">
                  <PiGear />
                </Icon>{' '}
                Settings
              </NavigationLink>
            )}
          </>
        )}

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
            <NavigationLink href={`/admin/email-notifications`}>
              <Icon size="md">
                <PiEnvelope />
              </Icon>{' '}
              Notifications
            </NavigationLink>
          </>
        )}
      </Flex>
      {orgId !== undefined && (
        <OrganizationSelector
          locale={locale}
          orgs={organizations}
          orgId={orgId}
          inDrawer={inDrawer}
        />
      )}
    </Flex>
  );
};

export default Navigation;
