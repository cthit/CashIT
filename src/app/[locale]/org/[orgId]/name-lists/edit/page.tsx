import { notFound } from 'next/navigation';
import { Box } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import NameListService from '@/services/nameListService';
import SessionService from '@/services/sessionService';
import GammaService from '@/services/gammaService';
import CreateNameListForm from '../create/CreateNameListForm';
import OrgService from '@/services/orgService';

export default async function Page(props: {
  searchParams: Promise<{ id?: string }>;
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { locale, orgId } = await props.params;
  const l = i18nService.getLocale(locale);

  const { id } = await props.searchParams;
  if (id === undefined) {
    notFound();
  }

  const nameList = await NameListService.getById(+id);
  if (nameList === null) notFound();
  const personal = nameList === null || nameList.gammaGroupId === null;
  const [divisionTreasurer, localAdmin] = await Promise.all([
    SessionService.isDivisionTreasurer(),
    SessionService.isOrgLocalAdmin(+orgId)
  ]);
  const isAdmin = divisionTreasurer || localAdmin;

  const group = !personal
    ? (await SessionService.getGroups()).find(
        (g) => g.group.id === nameList.gammaGroupId
      )?.group
    : undefined;

  if (!personal && !isAdmin && group === undefined) {
    notFound();
  }

  const sg =
    personal || group === undefined
      ? undefined
      : await GammaService.getSuperGroup(group.superGroup.id);
  if (!personal && !isAdmin && sg === undefined) {
    notFound();
  }

  const superGroups = await GammaService.getAllSuperGroups();
  const groups = (await SessionService.getGroups()).map((g) => g.group);

  const user = (await SessionService.getGammaUser())?.user;
  const canEdit =
    isAdmin ||
    group !== undefined ||
    user?.id === nameList.gammaUserId;

  if (!canEdit) {
    notFound();
  }

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
        <BreadcrumbLink as={Link} href={`/org/${orgId}/name-lists`}>
          {l.nameLists.list}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.general.edit}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <CreateNameListForm
        superGroups={superGroups}
        groups={groups}
        locale={locale}
        orgId={org.id}
        nl={nameList}
      />
    </>
  );
}
