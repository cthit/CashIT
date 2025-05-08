import { notFound } from 'next/navigation';
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

export default async function Page(props: {
  searchParams: Promise<{ gid?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { gid } = await props.searchParams;
  const { locale } = await props.params;

  const l = i18nService.getLocale(locale);

  const group =
    gid !== undefined
      ? (await SessionService.getGroups()).find((g) => g.group.id === gid)
          ?.group
      : undefined;
  if (gid !== undefined && group === undefined) {
    notFound();
  }

  const user = (await SessionService.getGammaUser())?.user;

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href={'/invoices'}>
          {l.categories.invoices}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.economy.create}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <SendInvoiceForm locale={locale} gid={gid} user={user} />
    </>
  );
}
