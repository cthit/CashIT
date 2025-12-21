'use server';

import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import SessionService from '@/services/sessionService';
import { notFound } from 'next/navigation';
import OrgService from '@/services/orgService';
import { Button } from '@/components/ui/button';
import { HiPlus } from 'react-icons/hi';
import OrganizationSettingsForm from './OrganizationSettingsForm';

export default async function Page(props: {
  params: Promise<{ locale: string, orgId: string }>;

}) {
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!divisionTreasurer) {
    notFound();
  }

  const { locale, orgId } = await props.params;
  const l = i18nService.getLocale(locale);

  const organization = await OrgService.getById(Number(orgId));
  if (!organization) {
    notFound();
  }

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink href="/">
          {l.home.title}
        </BreadcrumbLink>
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
