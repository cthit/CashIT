import { Box, Heading } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import SessionService from '@/services/sessionService';
import { notFound } from 'next/navigation';
import GoCardlessService from '@/services/goCardlessService';
import RecreateRequisitionButton from './RecreateRequisitionButton';

export default async function Page(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ requisition?: string }>;
}) {
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!divisionTreasurer) {
    notFound();
  }
  const requisitionId = (await props.searchParams).requisition;
  if (!requisitionId) {
    notFound();
  }

  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const requisitions = (await GoCardlessService.getRequisitions()).results;
  const requisition = requisitions.find((r) => r.id === requisitionId);
  if (!requisition) {
    notFound();
  }

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink  as={Link} href="/bank-accounts">
        {l.bankAccounts.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>Reconnect Accounts</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />

      <Heading as="h1" size="xl" display="inline" mr="auto">
        Reconnect Accounts
      </Heading>
      <p>Create a new requisition and add transfer accounts?</p>
      <RecreateRequisitionButton id={requisition.id} />
    </>
  );
}
