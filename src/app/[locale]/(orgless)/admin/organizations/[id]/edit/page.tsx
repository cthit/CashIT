import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import OrgService from '@/services/orgService';
import {
  BreadcrumbRoot,
  BreadcrumbLink,
  BreadcrumbCurrentLink
} from '@/components/ui/breadcrumb';
import SessionService from '@/services/sessionService';
import OrganizationForm from '../../OrganizationForm';
import GammaService from '@/services/gammaService';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

const EditOrganizationPage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const { locale, id } = resolvedParams;

  const divisionTreasurer = await SessionService.isDivisionTreasurer();

  if (!divisionTreasurer) {
    return (
      <Box p={8}>
        <Text>Access denied. Division treasurer role required.</Text>
      </Box>
    );
  }

  const organization = await OrgService.getById(Number(id));

  if (!organization) {
    notFound();
  }

  const superGroups = (await GammaService.getAllSuperGroups()).map(
    (sg) => sg.superGroup
  );

  return (
    <Box p={8}>
      <VStack align="stretch" gap={6}>
        <BreadcrumbRoot>
          <BreadcrumbLink asChild>
            <Link href={`/${locale}/admin/organizations`}>Organizations</Link>
          </BreadcrumbLink>
          <BreadcrumbLink asChild>
            <Link href={`/${locale}/admin/organizations/${id}`}>
              {organization.name}
            </Link>
          </BreadcrumbLink>
          <BreadcrumbCurrentLink>Edit</BreadcrumbCurrentLink>
        </BreadcrumbRoot>

        <Heading size="2xl">Edit Organization</Heading>

        <OrganizationForm
          mode="edit"
          organization={organization}
          superGroups={superGroups}
        />
      </VStack>
    </Box>
  );
};

export default EditOrganizationPage;
