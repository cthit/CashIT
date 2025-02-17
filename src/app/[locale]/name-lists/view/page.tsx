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

  const nameList = await NameListService.getById(+id);
  if (nameList === null) notFound();
  const personal = nameList === null || nameList.gammaGroupId === null;
  const divisionTreasurer = await SessionService.isDivisionTreasurer();

  const group = !personal
    ? (await SessionService.getGroups()).find(
        (g) => g.group.id === nameList.gammaGroupId
      )?.group
    : undefined;

  if (!personal && !divisionTreasurer && group === undefined) {
    notFound();
  }

  const sg = personal
    ? undefined
    : await GammaService.getSuperGroup(group!.superGroup.id);
  if (!personal && !divisionTreasurer && sg === undefined) {
    notFound();
  }

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
              (nameList.gammaGroupId ? '?gid=' + nameList.gammaGroupId : '')
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
            '/name-lists' +
            (nameList.gammaGroupId ? '?gid=' + nameList.gammaGroupId : '')
          }
        >
          {l.nameLists.list}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{nameList.name}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <CreateNameListForm g={group} sg={sg} locale={locale} nl={nameList} />
    </>
  );
}
