import { notFound } from 'next/navigation';
import SessionService from '@/services/sessionService';
import Link from 'next/link';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import { Box } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import InvoiceService from '@/services/invoiceService';
import InvoicesTable from '@/components/InvoicesTable/InvoicesTable';
import i18nService from '@/services/i18nService';

export default async function Page(props: {
  searchParams: Promise<{ gid?: string; sgid?: string; show?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const { gid, sgid, show } = await props.searchParams;
  const useSuperGroup = !gid;
  const personal = !gid && !sgid;
  const id = personal ? undefined : useSuperGroup ? sgid : gid;
  const idParam = personal
    ? undefined
    : `${useSuperGroup ? 'sgid' : 'gid'}=${id}`;

  const groups = await (useSuperGroup
    ? SessionService.getSuperGroups()
    : SessionService.getGroups());
  const group = groups.find((g) => g.group.id === id)?.group;

  if (!personal && !group) notFound();

  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const fetchAll = show === 'all' && divisionTreasurer;
  const isTreasurer = fetchAll
    ? false
    : group
    ? await SessionService.isTreasurerInGroup(group.id)
    : false;

  const invoices = fetchAll
    ? await InvoiceService.getAllPrettified()
    : personal
    ? await SessionService.getInvoices()
    : useSuperGroup
    ? await InvoiceService.getPrettifiedForSuperGroup(sgid!)
    : await InvoiceService.getPrettifiedForGroup(gid!);

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        {group ? (
          <BreadcrumbLink as={Link} href={'/group?' + idParam}>
            {group.prettyName}
          </BreadcrumbLink>
        ) : (
          !fetchAll && (
            <BreadcrumbLink as={Link} href="/groupless">
              {l.home.personal}
            </BreadcrumbLink>
          )
        )}
        <BreadcrumbCurrentLink>{l.categories.invoices}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <InvoicesTable
        e={invoices}
        showGroups={fetchAll || (!personal && useSuperGroup)}
        locale={locale}
        personal={personal && !fetchAll}
      />
      <Box p="4" />
      {!fetchAll && (personal || (!useSuperGroup && isTreasurer)) && (
        <Link href={'/invoices/create' + (personal ? '' : '?gid=' + gid)}>
          <Button variant="surface">{l.invoice.new}</Button>
        </Link>
      )}
    </>
  );
}
