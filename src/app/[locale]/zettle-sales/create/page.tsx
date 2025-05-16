import { Box } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import SessionService from '@/services/sessionService';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import CreateZettleSaleForm from './CreateZettleSaleForm';

export default async function Page(props: {
  searchParams: Promise<{ gid?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

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
        <BreadcrumbCurrentLink>{l.zettleSales.create}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <CreateZettleSaleForm groups={groups} locale={locale} />
    </>
  );
}
