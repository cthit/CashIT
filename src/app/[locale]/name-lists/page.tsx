import SessionService from '@/services/sessionService';
import Link from 'next/link';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import NameListTable from '@/components/NameListTable/NameListTable';
import i18nService from '@/services/i18nService';
import NameListService from '@/services/nameListService';

export default async function Page(props: {
  searchParams: Promise<{ gid?: string; sgid?: string; show?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const groups = await SessionService.getGroups();

  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const lists = await (divisionTreasurer
    ? NameListService.getAll()
    : SessionService.getNameLists());

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.nameLists.title}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <Flex alignItems="center" justifyContent="space-between">
        <Heading as="h1" size="xl">
          {l.nameLists.title}
        </Heading>
        <Link href={'/name-lists/create'}>
          <Button colorPalette="cyan">{l.nameLists.create}</Button>
        </Link>
      </Flex>
      <Box p="2" />
      <NameListTable e={lists} locale={locale} groups={groups} />
    </>
  );
}
