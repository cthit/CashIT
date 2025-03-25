'use client';

import { Prisma } from '@prisma/client';
import { forwardExpenseToEmail } from '@/actions/expenses';
import { FormEvent, useCallback, useState } from 'react';
import { Box, Fieldset, Heading, Input } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import i18nService from '@/services/i18nService';
import { Field } from '@/components/ui/field';

export default function ForwardExpenseForm({
  locale,
  e
}: {
  locale: string;
  e?: Prisma.ExpenseGetPayload<{ include: { receipts: true } }>;
}) {
  const l = i18nService.getLocale(locale);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      if (e) {
        setLoading(true);
        await forwardExpenseToEmail(e.id, email);
        setEmail('');
        setLoading(false);
      }
    },
    [e, email]
  );

  return (
    <form onSubmit={submit}>
      <Heading>{l.expense.forward}</Heading>
      <Box p="1" />
      <Fieldset.Root width={400}>
        <Fieldset.Content>
          <Field label="Email">
            <Input
              type="email"
              placeholder="mail@chalmers.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </Field>
          <Field>
            <Button variant="surface" type="submit" disabled={loading}>
              {l.economy.submit}
            </Button>
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </form>
  );
}
