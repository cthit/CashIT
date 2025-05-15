import SessionService from '@/services/sessionService';
import Link from 'next/link';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import InvoicesTable from '@/components/InvoicesTable/InvoicesTable';
import i18nService from '@/services/i18nService';
import InvoiceService from '@/services/invoiceService';
import { HiPlus } from 'react-icons/hi';
import GammaService from '@/services/gammaService';

export default async function Page(props: {
  searchParams: Promise<{ gid?: string; sgid?: string; show?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const groups = await SessionService.getGroups();

  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  const invoices = await GammaService.includeUserInfo(
    await (divisionTreasurer
      ? InvoiceService.getAll()
      : SessionService.getInvoices())
  );

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.categories.invoices}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <Flex alignItems="center" justifyContent="space-between">
        <Heading as="h1" size="xl">
          {l.categories.invoices}
        </Heading>
        <Link href={'/invoices/create'}>
          <Button colorPalette="cyan">
            <HiPlus /> {l.invoice.new}
          </Button>
        </Link>
      </Flex>
      <Box p="2" />
      <InvoicesTable e={invoices} locale={locale} groups={groups} />
    </>
  );
}
