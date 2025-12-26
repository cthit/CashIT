'use client';

import {
  registerRequisition,
  createNewRequisition
} from '@/actions/goCardless';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from '@/components/ui/select';
import { Requisition } from '@/services/goCardlessService';
import i18nService from '@/services/i18nService';
import {
  Box,
  createListCollection,
  VStack,
  Heading,
  Text
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

interface Institution {
  id: string;
  name: string;
  bic?: string;
  transaction_total_days?: string;
  max_access_valid_for_days?: string;
  countries: string[];
  logo: string;
}

export default function AddRequisitionForm({
  requisitions,
  institutions,
  orgId,
  locale
}: {
  requisitions: Requisition[];
  institutions: Institution[];
  orgId: string;
  locale: string;
}) {
  const router = useRouter();
  const l = i18nService.getLocale(locale);
  const [existingRequisitionId, setExistingRequisitionId] = useState<
    string | undefined
  >();
  const [newInstitutionId, setNewInstitutionId] = useState<
    string | undefined
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitExisting = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (existingRequisitionId && !isSubmitting) {
        setIsSubmitting(true);
        try {
          await registerRequisition(existingRequisitionId);
          router.push(`/org/${orgId}/bank-accounts`);
        } catch (error) {
          console.error('Error registering requisition:', error);
          setIsSubmitting(false);
        }
      }
    },
    [existingRequisitionId, router, isSubmitting, orgId]
  );

  const submitNew = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (newInstitutionId && !isSubmitting) {
        setIsSubmitting(true);
        try {
          const newRequisition = await createNewRequisition(
            newInstitutionId,
            orgId
          );
          // Redirect to the GoCardless link
          window.location.href = newRequisition.link;
        } catch (error) {
          console.error('Error creating requisition:', error);
          setIsSubmitting(false);
        }
      }
    },
    [newInstitutionId, isSubmitting, orgId]
  );

  const existingReqs = createListCollection({
    items: requisitions.map((r) => ({
      label: `${r.reference} (${r.status})`,
      value: r.id
    }))
  });

  const institutionList = createListCollection({
    items: (process.env.NODE_ENV === 'development'
      ? [{ label: 'Sandbox Finance', value: 'SANDBOXFINANCE_SFIN0000' }]
      : []
    ).concat(
      institutions.map((i) => ({
        label: i.name,
        value: i.id
      }))
    )
  });

  return (
    <VStack gap={8} align="stretch" maxW="2xl">
      {/* Existing Unused Requisitions */}
      {requisitions.length > 0 && (
        <Box>
          <Heading size="lg" mb={4}>
            {l.bankConnections.useExisting}
          </Heading>
          <Text color="fg.muted" mb={4}>
            {l.bankConnections.existingDescription}
          </Text>
          <form onSubmit={submitExisting}>
            <VStack gap={4} align="stretch">
              <Field label={l.bankConnections.selectConnection} required>
                <SelectRoot
                  collection={existingReqs}
                  value={existingRequisitionId ? [existingRequisitionId] : []}
                  onValueChange={({ value }) =>
                    setExistingRequisitionId(value?.[0])
                  }
                >
                  <SelectLabel />
                  <SelectTrigger>
                    <SelectValueText
                      placeholder={l.bankConnections.selectPlaceholder}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {existingReqs.items.map((item) => (
                      <SelectItem key={item.value} item={item}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </Field>
              <Button
                variant="surface"
                type="submit"
                disabled={!existingRequisitionId || isSubmitting}
                loading={isSubmitting}
              >
                {l.general.create}
              </Button>
            </VStack>
          </form>
        </Box>
      )}

      {/* Create New Connection */}
      <Box>
        <Heading size="lg" mb={4}>
          {l.bankConnections.newConnection}
        </Heading>
        <Text color="fg.muted" mb={4}>
          {l.bankConnections.newConnection}
        </Text>
        <form onSubmit={submitNew}>
          <VStack gap={4} align="stretch">
            <Field label={l.bankAccounts.title} required>
              <SelectRoot
                collection={institutionList}
                value={newInstitutionId ? [newInstitutionId] : []}
                onValueChange={({ value }) => setNewInstitutionId(value?.[0])}
              >
                <SelectLabel />
                <SelectTrigger>
                  <SelectValueText placeholder={l.general.search} />
                </SelectTrigger>
                <SelectContent>
                  {institutionList.items.map((item) => (
                    <SelectItem key={item.value} item={item}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Field>
            <Button
              variant="solid"
              type="submit"
              disabled={!newInstitutionId || isSubmitting}
              loading={isSubmitting}
            >
              {l.bankConnections.addConnection}
            </Button>
          </VStack>
        </form>
      </Box>
    </VStack>
  );
}
