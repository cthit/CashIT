import SessionService from '@/services/sessionService';
import Link from 'next/link';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import { Box } from '@chakra-ui/react';
import SendInvoiceForm from './SendInvoiceForm';
import i18nService from '@/services/i18nService';
import OrgService from '@/services/orgService';
import { notFound } from 'next/navigation';

export default async function Page(props: {
  searchParams: Promise<{ gid?: string }>;
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { gid } = await props.searchParams;
  const { locale, orgId } = await props.params;

  const l = i18nService.getLocale(locale);

  const user = (await SessionService.getGammaUser())?.user;
  const groups = await SessionService.getActiveGroups();

  const org = await OrgService.getById(+orgId);
  if (!org) {
    notFound();
  }

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href={`/org/${orgId}`}>
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href={`/org/${orgId}/invoices`}>
          {l.categories.invoices}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.economy.create}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <SendInvoiceForm
        locale={locale}
        groups={groups}
        user={user}
        orgId={org.id}
      />
    </>
  );
}
