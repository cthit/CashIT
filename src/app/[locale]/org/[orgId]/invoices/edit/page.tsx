import { notFound } from 'next/navigation';
import SessionService from '@/services/sessionService';
import Link from 'next/link';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import { Box } from '@chakra-ui/react';
import InvoiceService from '@/services/invoiceService';
import SendInvoiceForm from '../create/SendInvoiceForm';
import i18nService from '@/services/i18nService';
import OrgService from '@/services/orgService';

export default async function Page(props: {
  searchParams: Promise<{ id?: string }>;
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { locale, orgId } = await props.params;
  const l = i18nService.getLocale(locale);

  const { id } = await props.searchParams;
  if (id === undefined) notFound();

  const invoice = await InvoiceService.getById(+id);
  if (invoice === null) notFound();
  const personal = invoice.gammaGroupId === null;

  const divisionTreasurer = await SessionService.isDivisionTreasurer();

  const group =
    !personal && !divisionTreasurer
      ? (await SessionService.getGroups()).find(
          (g) => g.group.id === invoice.gammaGroupId
        )?.group
      : undefined;

  if (!personal && !divisionTreasurer && group === undefined) {
    notFound();
  }

  const user = (await SessionService.getGammaUser())?.user;
  const canEdit =
    divisionTreasurer ||
    group !== undefined ||
    user?.id === invoice.gammaUserId;

  if (!canEdit) {
    notFound();
  }

  const groups = (await SessionService.getGroups()).map((g) => g.group);

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
        <BreadcrumbCurrentLink>{l.general.edit}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <SendInvoiceForm
        groups={groups}
        i={invoice}
        locale={locale}
        orgId={org.id}
        user={user}
      />
    </>
  );
}