'use client';

import { useCallback, useState } from 'react';
import { Box, Fieldset, Heading, Input } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import i18nService from '@/services/i18nService';
import { useRouter } from 'next/navigation';
import { createZettleSale, editZettleSale } from '@/actions/zettleSales';
import ZettleSaleService from '@/services/zettleSaleService';

export default function CreateZettleSaleForm({
  gid,
  locale,
  s
}: {
  gid: string;
  locale: string;
  s?: Awaited<ReturnType<typeof ZettleSaleService.getById>>;
}) {
  const l = i18nService.getLocale(locale);

  const router = useRouter();

  const [name, setName] = useState<string>(s?.name ?? '');
  const [date, setDate] = useState<string>(
    s?.saleDate ? i18nService.formatDate(s.saleDate, false) : ''
  );
  const [amount, setAmount] = useState<string>(s?.amount?.toString() ?? '');

  const createSale = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      (s
        ? editZettleSale(s.id, name, +amount, new Date(date))
        : createZettleSale(gid, name, +amount, new Date(date))
      ).then(() => router.push(`/zettle-sales?gid=${gid}`));
    },
    [amount, date, gid, name, router, s]
  );

  return (
    <form onSubmit={createSale}>
      <Heading>New Sale</Heading>
      <Box p="2.5" />

      <Fieldset.Root maxW="md" size="lg">
        <Fieldset.Content>
          <Field label="Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field label="Date" required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>

          <Field label="Amount" required>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>

          <Field>
            <Button variant="surface" type="submit">
              {l.economy.submit}
            </Button>
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </form>
  );
}
