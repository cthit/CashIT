import SessionService from '@/services/sessionService';
import Link from 'next/link';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import { Box } from '@chakra-ui/react';
import NameListTable from '@/components/NameListTable/NameListTable';
import i18nService from '@/services/i18nService';
import NameListService from '@/services/nameListService';
import GammaService from '@/services/gammaService';

export default async function Page(props: {
  searchParams: Promise<{ gid?: string; sgid?: string; show?: string }>;
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { locale, orgId } = await props.params;
  const l = i18nService.getLocale(locale);

  const superGroups = await GammaService.getAllSuperGroups();

  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const lists = await GammaService.includeUserInfo(
    await (divisionTreasurer
      ? NameListService.getAll(Number(orgId))
      : SessionService.getNameLists(Number(orgId)))
  );

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href={`/org/${orgId}`}>
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.nameLists.title}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <NameListTable
        e={lists}
        locale={locale}
        superGroups={superGroups}
        orgId={Number(orgId)}
      />
    </>
  );
}
