'use client';

import { Prisma } from '@prisma/client';
import { forwardExpenseToEmail } from '@/actions/expenses';
import { FormEvent, useCallback, useState } from 'react';
import { Input } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';

export default function ForwardExpenseForm({
  e
}: {
  e?: Prisma.ExpenseGetPayload<{ include: { receipts: true } }>;
}) {
  const [email, setEmail] = useState<string>('');

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      if (e) {
        await forwardExpenseToEmail(e.id, email);
      }
    },
    [e, email]
  );

  return (
    <form onSubmit={submit}>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button  variant="surface" type="submit">Forward</Button>
    </form>
  );
}
