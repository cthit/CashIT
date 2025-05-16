import { notFound } from 'next/navigation';
import { Box } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import CreateZettleSaleForm from '../create/CreateZettleSaleForm';
import ZettleSaleService from '@/services/zettleSaleService';
import SessionService from '@/services/sessionService';

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

  const sale = await ZettleSaleService.getById(+id);
  if (sale === null) {
    notFound();
  }

  const groups = (await SessionService.getGroups()).map((g) => g.group);

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href={'/zettle-sales'}>
          {l.home.zettleSales}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.general.edit}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <CreateZettleSaleForm groups={groups} locale={locale} s={sale} />
    </>
  );
}
