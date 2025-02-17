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

export default async function Page(props: {
  searchParams: Promise<{ id?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const { id } = await props.searchParams;
  if (id === undefined) {
    notFound();
  }

  const invoice = await InvoiceService.getById(+id);
  if (invoice === null) {
    notFound();
  }
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
    divisionTreasurer || group || user?.id === invoice.gammaUserId;

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        {group ? (
          <BreadcrumbLink
            as={Link}
            href={
              '/group' +
              (invoice.gammaGroupId ? '?gid=' + invoice.gammaGroupId : '')
            }
          >
            {group.prettyName}
          </BreadcrumbLink>
        ) : (
          <BreadcrumbLink as={Link} href="/groupless">
            {l.home.personal}
          </BreadcrumbLink>
        )}
        <BreadcrumbLink
          as={Link}
          href={
            '/invoices' +
            (invoice.gammaGroupId ? '?gid=' + invoice.gammaGroupId : '')
          }
        >
          {l.categories.invoices}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.general.edit}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <SendInvoiceForm
        gid={invoice.gammaGroupId ?? undefined}
        i={invoice}
        locale={locale}
        user={user}
      />
    </>
  );
}
