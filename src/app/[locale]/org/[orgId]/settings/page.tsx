'use server';

import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import i18nService from '@/services/i18nService';
import SessionService from '@/services/sessionService';
import { notFound } from 'next/navigation';
import OrgService from '@/services/orgService';
import OrganizationSettingsForm from './OrganizationSettingsForm';

export default async function Page(props: {
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { locale, orgId } = await props.params;
  const orgIdNum = Number(orgId);

  const [divisionTreasurer, localAdmin] = await Promise.all([
    SessionService.isDivisionTreasurer(),
    SessionService.isOrgLocalAdmin(orgIdNum)
  ]);
  if (!divisionTreasurer && !localAdmin) {
    notFound();
  }
  const l = i18nService.getLocale(locale);

  const organization = await OrgService.getById(Number(orgId));
  if (!organization) {
    notFound();
  }

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink href={`/org/${orgId}`}>{l.home.title}</BreadcrumbLink>
        <BreadcrumbCurrentLink>{organization.name}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />

      <VStack gap={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="xl">
              Organization
            </Heading>
            <Text color="fg.muted" mt={2}>
              Manage your organization settings
            </Text>
          </Box>
        </Flex>
      </VStack>

      <OrganizationSettingsForm locale={locale} organization={organization} />
    </>
  );
}
