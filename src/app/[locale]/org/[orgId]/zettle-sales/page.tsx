import SessionService from '@/services/sessionService';
import Link from 'next/link';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import { Box } from '@chakra-ui/react';
import ZettleSaleService from '@/services/zettleSaleService';
import ZettleSalesTable from '@/components/ZettleSalesTable/ZettleSalesTable';
import i18nService from '@/services/i18nService';
import GammaService from '@/services/gammaService';

export default async function Page(props: {
  searchParams: Promise<{ gid?: string; show?: string }>;
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { locale, orgId } = await props.params;
  const l = i18nService.getLocale(locale);

  const superGroups = await GammaService.getAllSuperGroups();

  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const sales = await GammaService.includeUserInfo(
    await (divisionTreasurer
      ? ZettleSaleService.getAll(Number(orgId))
      : SessionService.getZettleSales(Number(orgId)))
  );

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href={`/org/${orgId}`}>
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.home.zettleSales}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <ZettleSalesTable
        e={sales}
        superGroups={superGroups}
        locale={locale}
        orgId={Number(orgId)}
      />
    </>
  );
}
