'use client';

import { editOwnForwardEmail } from '@/actions/user';
import { Field } from '@/components/ui/field';
import i18nService from '@/services/i18nService';
import { Box, Button, Fieldset, Input } from '@chakra-ui/react';
import { Prisma } from '@prisma/client';
import { useCallback, useState } from 'react';

export default function UserSettingsForm({
  locale,
  user
}: {
  locale: string;
  user: Prisma.UserGetPayload<{}> | null;
}) {
  const l = i18nService.getLocale(locale);

  const [email, setEmail] = useState(user?.forwardEmail ?? '');

  const save = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await editOwnForwardEmail(email);
    },
    [email]
  );

  return (
    <form onSubmit={save}>
      <Fieldset.Root maxW="md" size="lg">
        <Fieldset.Content mt="0.25rem">
          <Field label={l.userSettings.forwardEmail}>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
      <Box p="4" />
      <Button variant="surface" type="submit">
        {l.general.save}
      </Button>
    </form>
  );
}
