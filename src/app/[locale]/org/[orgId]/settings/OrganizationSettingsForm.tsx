"use client";

import {
  Box,
  Fieldset,
  Input,
  Heading,
  createListCollection,
  IconButton,
  Text,
  Table
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import i18nService from '@/services/i18nService';
import OrgService from '@/services/orgService';

export default function OrganizationSettingsForm({
    locale,
    organization
}: {locale: string, organization: NonNullable<Awaited<ReturnType<typeof OrgService.getById>>>}) {
  const l = i18nService.getLocale(locale);

  return <form>
    <Fieldset.Root maxW="md" size="lg">
            <Fieldset.Content mt="0.25rem">
              <Field
                label={l.general.description}
                helperText={l.receipt.nameHint}
                required
              >
                <Input value={organization.name} />
              </Field>
            </Fieldset.Content>
          </Fieldset.Root>
  </form>;
}
