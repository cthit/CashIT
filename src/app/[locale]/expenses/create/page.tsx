import { notFound } from 'next/navigation';
import { Box } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import SessionService from '@/services/sessionService';
import CreateExpenseForm from './CreateExpenseForm';
import Link from 'next/link';
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

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        {group && (
          <BreadcrumbLink as={Link} href={'/group?gid=' + gid}>
            {group.prettyName}
          </BreadcrumbLink>
        )}
        <BreadcrumbLink
          as={Link}
          href={'/expenses' + (gid ? '?gid=' + gid : '')}
        >
          {l.categories.expenses}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.economy.create}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <CreateExpenseForm gid={gid} locale={locale} />
    </>
  );
}
