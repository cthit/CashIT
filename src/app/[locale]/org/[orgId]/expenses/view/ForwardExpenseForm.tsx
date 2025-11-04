'use client';

import { Prisma } from '@prisma/client';
import { forwardExpenseToEmail } from '@/actions/expenses';
import { FormEvent, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import i18nService from '@/services/i18nService';

export default function ForwardExpenseForm({
  locale,
  e
}: {
  locale: string;
  e?: Prisma.ExpenseGetPayload<{ include: { receipts: true } }>;
}) {
  const l = i18nService.getLocale(locale);
  const [loading, setLoading] = useState<boolean>(false);

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      if (e) {
        setLoading(true);
        await forwardExpenseToEmail(e.id);
        setLoading(false);
      }
    },
    [e]
  );

  return (
    <Button variant="surface" type="submit" disabled={loading} onClick={submit}>
      {l.expense.forward}
    </Button>
  );
}
