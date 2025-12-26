import { Box, Heading, Stack, Text, VStack } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import OrgService from '@/services/orgService';
import { BreadcrumbRoot, BreadcrumbLink, BreadcrumbCurrentLink } from '@/components/ui/breadcrumb';
import SessionService from '@/services/sessionService';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

const ViewOrganizationPage = async ({ params }: PageProps) => {
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

  return (
    <Box p={8}>
      <VStack align="stretch" gap={6}>
        <BreadcrumbRoot>
          <BreadcrumbLink asChild>
            <Link href={`/${locale}/admin/organizations`}>Organizations</Link>
          </BreadcrumbLink>
          <BreadcrumbCurrentLink>{organization.name}</BreadcrumbCurrentLink>
        </BreadcrumbRoot>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="2xl">{organization.name}</Heading>
          <Button asChild colorPalette="cyan">
            <Link href={`/${locale}/admin/organizations/${id}/edit`}>Edit</Link>
          </Button>
        </Box>

        <Stack gap={4}>
          <Box>
            <Text fontWeight="bold">ID</Text>
            <Text>{organization.id}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Name</Text>
            <Text>{organization.name}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Primary Email</Text>
            <Text>{organization.primaryEmail}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Owner Gamma Super Group ID</Text>
            <Text>{organization.ownerGammaSuperGroupId}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Updated At</Text>
            <Text>{organization.updatedAt.toLocaleDateString()}</Text>
          </Box>
        </Stack>
      </VStack>
    </Box>
  );
};

export default ViewOrganizationPage;
