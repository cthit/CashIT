import SessionService from '@/services/sessionService';
import Link from 'next/link';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import ZettleSaleService from '@/services/zettleSaleService';
import ZettleSalesTable from '@/components/ZettleSalesTable/ZettleSalesTable';
import i18nService from '@/services/i18nService';

export default async function Page(props: {
  searchParams: Promise<{ gid?: string; show?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const groups = await SessionService.getGroups();

  const sales = await ZettleSaleService.getAllPrettified();
  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.home.zettleSales}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <Flex alignItems="center" justifyContent="space-between">
        <Heading as="h1" size="xl">
          {l.home.zettleSales}
        </Heading>
        <Link href={'/zettle-sales/create'}>
          <Button colorPalette="cyan">{l.zettleSales.create}</Button>
        </Link>
      </Flex>
      <Box p="2" />
      <ZettleSalesTable e={sales} groups={groups} locale={locale} />
    </>
  );
}
