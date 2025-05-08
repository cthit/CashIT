import { notFound } from 'next/navigation';
import { Box } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import SessionService from '@/services/sessionService';
import CreateNameListForm from './CreateNameListForm';
import Link from 'next/link';
import GammaService from '@/services/gammaService';
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

  const sg = group
    ? await GammaService.getSuperGroup(group.superGroup.id)
    : undefined;
  if (gid !== undefined && sg === undefined) {
    notFound();
  }

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href={'/name-lists'}>
          {l.nameLists.list}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.economy.create}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <CreateNameListForm g={group} sg={sg} locale={locale} />
    </>
  );
}
