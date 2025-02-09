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

export default async function Page(props: {
  searchParams: Promise<{ id?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { id } = await props.searchParams;
  const { locale } = await props.params;

  if (id === undefined) {
    notFound();
  }

  const invoice = await InvoiceService.getById(+id);

  if (invoice === null || invoice.gammaGroupId === null) {
    notFound();
  }

  const group = (await SessionService.getGroups()).find(
    (g) => g.group.id === invoice.gammaGroupId
  )?.group;

  if (group === undefined) {
    notFound();
  }

  const user = (await SessionService.getGammaUser())?.user;

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          Home
        </BreadcrumbLink>
        <BreadcrumbLink
          as={Link}
          href={
            '/group' +
            (invoice.gammaGroupId ? '?gid=' + invoice.gammaGroupId : '')
          }
        >
          {group.prettyName}
        </BreadcrumbLink>
        <BreadcrumbLink
          as={Link}
          href={
            '/invoices' +
            (invoice.gammaGroupId ? '?gid=' + invoice.gammaGroupId : '')
          }
        >
          Invoices
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>Edit</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <SendInvoiceForm
        gid={invoice.gammaGroupId}
        i={invoice}
        locale={locale}
        user={user}
      />
    </>
  );
}
