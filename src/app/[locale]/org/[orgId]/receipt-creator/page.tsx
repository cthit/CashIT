import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import i18nService from '@/services/i18nService';
import { Box } from '@chakra-ui/react';
import Link from 'next/link';
import ReceiptCreateForm from './ReceiptCreateForm';
import OrgService from '@/services/orgService';
import { notFound } from 'next/navigation';

export default async function Home(props: {
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { locale, orgId } = await props.params;
  const l = i18nService.getLocale(locale);

  const org = await OrgService.getById(Number(orgId));
  if (!org) {
    notFound();
  }

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href={`/org/${orgId}`}>
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.receipt.title}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <ReceiptCreateForm locale={locale} orgName={org.name} />
    </>
  );
}
