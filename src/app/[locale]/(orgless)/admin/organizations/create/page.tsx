import { Box, Heading } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import SessionService from '@/services/sessionService';
import { notFound } from 'next/navigation';
import OrganizationForm from '../OrganizationForm';
import GammaService from '@/services/gammaService';

export default async function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!divisionTreasurer) {
    notFound();
  }

  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);
  const superGroups = (await GammaService.getAllSuperGroups()).map(
    (sg) => sg.superGroup
  );

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href="/admin/organizations">
          Organizations
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>Create</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />

      <Heading as="h1" size="xl" mb={6}>
        Create Organization
      </Heading>

      <OrganizationForm mode="create" superGroups={superGroups} />
    </>
  );
}
