'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Input, VStack } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import {
  createOrganization,
  updateOrganization
} from '@/actions/organizations';
import { Organization } from '@prisma/client';

interface OrganizationFormProps {
  mode: 'create' | 'edit';
  organization?: Organization;
}

const OrganizationForm = ({ mode, organization }: OrganizationFormProps) => {
  const router = useRouter();
  const [name, setName] = useState(organization?.name ?? '');
  const [primaryEmail, setPrimaryEmail] = useState(
    organization?.primaryEmail ?? ''
  );
  const [ownerGammaSuperGroupId, setOwnerGammaSuperGroupId] = useState(
    organization?.ownerGammaSuperGroupId ?? ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        if (mode === 'create') {
          await createOrganization(name, primaryEmail, ownerGammaSuperGroupId);
          router.push('/admin/organizations');
        } else if (organization) {
          await updateOrganization(
            organization.id,
            name,
            primaryEmail,
            ownerGammaSuperGroupId
          );
          router.push(`/admin/organizations/${organization.id}`);
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    },
    [mode, name, organization, router, primaryEmail, ownerGammaSuperGroupId]
  );

  return (
    <Box maxW="2xl">
      <form onSubmit={handleSubmit}>
        <VStack gap={6} align="stretch">
          <Field label="Organization Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter organization name"
              required
              disabled={loading}
            />
          </Field>

          <Field label="Primary Email" required>
            <Input
              type="email"
              value={primaryEmail}
              onChange={(e) => setPrimaryEmail(e.target.value)}
              placeholder="Enter primary email"
              required
              disabled={loading}
            />
          </Field>

          <Field label="Owner Gamma Super Group ID" required>
            <Input
              value={ownerGammaSuperGroupId}
              onChange={(e) => setOwnerGammaSuperGroupId(e.target.value)}
              placeholder="Enter owner gamma super group ID"
              required
              disabled={loading}
            />
          </Field>

          {error && (
            <Box p={4} bg="red.50" color="red.800" rounded="md">
              {error}
            </Box>
          )}

          <Box>
            <Button
              type="submit"
              colorPalette="cyan"
              loading={loading}
              disabled={loading || !name.trim()}
            >
              {mode === 'create'
                ? 'Create Organization'
                : 'Update Organization'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              ml={2}
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </VStack>
      </form>
    </Box>
  );
};

export default OrganizationForm;
