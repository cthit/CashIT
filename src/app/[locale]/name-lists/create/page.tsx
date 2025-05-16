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
  const { locale } = await props.params;

  const l = i18nService.getLocale(locale);

  const superGroups = await GammaService.getAllSuperGroups();
  const groups = (await SessionService.getGroups()).map((g) => g.group);

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
      <CreateNameListForm
        groups={groups}
        superGroups={superGroups}
        locale={locale}
      />
    </>
  );
}
