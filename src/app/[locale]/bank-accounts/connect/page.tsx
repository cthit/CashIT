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
import AddRequisitionForm from './AddRequisitionForm';

export default async function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!divisionTreasurer) {
    notFound();
  }

  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const localRequisitions = await GoCardlessService.getRegisteredRequisitions();
  const requisitions = (await GoCardlessService.getRequisitions()).results;
  const institutions = await GoCardlessService.getInstitutions();
  const unusedRequisitions = requisitions.filter(
    (r) => !localRequisitions.find((lr) => lr.goCardlessId === r.id) && r.status !== 'EX'
  );

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink  as={Link} href="/bank-accounts">
        {l.bankAccounts.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>Add Connection</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />

      <Heading as="h1" size="xl" display="inline" mr="auto">
        Add Connection
      </Heading>
      <AddRequisitionForm requisitions={unusedRequisitions} institutions={institutions} />
    </>
  );
}
