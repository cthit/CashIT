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
import OrgService from '@/services/orgService';
import { notFound } from 'next/navigation';

export default async function Page(props: {
  searchParams: Promise<{ gid?: string }>;
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { locale, orgId } = await props.params;

  const l = i18nService.getLocale(locale);

  const org = await OrgService.getById(+orgId);
  if (!org) {
    notFound();
  }

  const groups = (await SessionService.getGroups()).map((g) => g.group);

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href={'/expenses'}>
          {l.categories.expenses}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.economy.create}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <CreateExpenseForm groups={groups} locale={locale} orgId={org.id} />
    </>
  );
}
