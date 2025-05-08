import { notFound } from 'next/navigation';
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

  const { gid } = await props.searchParams;
  if (gid === undefined) {
    notFound();
  }

  const group =
    gid !== undefined
      ? (await SessionService.getGroups()).find((g) => g.group.id === gid)
          ?.group
      : undefined;
  if (group === undefined) {
    notFound();
  }

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
      <CreateZettleSaleForm gid={group.id} locale={locale} />
    </>
  );
}
