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
import ZettleSaleService from '@/services/zettleSaleService';
import ZettleSalesTable from '@/components/ZettleSalesTable/ZettleSalesTable';
import i18nService from '@/services/i18nService';

export default async function Page(props: {
  searchParams: Promise<{ gid?: string; sgid?: string; show?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const { gid, sgid, show } = await props.searchParams;

  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const fetchAll = show === 'all' && divisionTreasurer;

  if (!fetchAll && gid === undefined && sgid === undefined) {
    notFound();
  }
  const useSuperGroup = gid === undefined;
  const id = useSuperGroup ? sgid : gid;
  const idParam = useSuperGroup ? 'sgid=' + sgid : 'gid=' + gid;

  const group = useSuperGroup
    ? (await SessionService.getSuperGroups()).find((g) => g.group.id === id)
        ?.group
    : (await SessionService.getGroups()).find((g) => g.group.id === id)?.group;
  if (!fetchAll && group === undefined) {
    notFound();
  }

  const isTreasurer = fetchAll
    ? false
    : await SessionService.isTreasurerInGroup(group!.id);

  const sales = fetchAll
    ? await ZettleSaleService.getAllPrettified()
    : useSuperGroup
    ? await ZettleSaleService.getPrettifiedForSuperGroup(sgid!)
    : await ZettleSaleService.getPrettifiedForGroup(gid!);

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        {group && (
          <BreadcrumbLink as={Link} href={'/group?' + idParam}>
            {group.prettyName}
          </BreadcrumbLink>
        )}
        <BreadcrumbCurrentLink>{l.home.zettleSales}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <ZettleSalesTable
        e={sales}
        showGroups={fetchAll || useSuperGroup}
        locale={locale}
      />
      <Box p="4" />
      {!useSuperGroup && isTreasurer && (
        <Link href={`/zettle-sales/create?gid=${gid}`}>
          <Button variant="surface">{l.zettleSales.create}</Button>
        </Link>
      )}
    </>
  );
}
