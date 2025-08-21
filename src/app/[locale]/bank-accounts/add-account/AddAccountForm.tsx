'use client';

import { registerBankAccount } from '@/actions/goCardless';
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
import { Box, createListCollection } from '@chakra-ui/react';
import { Prisma } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

export default function AddAccountForm({
  requisition,
  accounts
}: {
  requisition: Requisition;
  accounts: Prisma.BankAccountGetPayload<{}>[];
}) {
  const router = useRouter();
  const [accId, setAccId] = useState<string | undefined>();

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (accId && requisition.id) {
        await registerBankAccount(accId, requisition.id);
        router.push('/bank-accounts');
      }
    },
    [accId, requisition, router]
  );

  const requisitionAccounts = useMemo(
    () =>
      createListCollection({
        items:
          requisition?.accounts?.filter(
            (a) => !accounts.find((b) => b.goCardlessId === a)
          ) ?? []
      }),
    [requisition, accounts]
  );

  console.log('Requisition Accounts:', requisition.accounts);

  return (
    <form onSubmit={submit}>
      <Field label="Account ID" required>
        <SelectRoot
          collection={requisitionAccounts}
          value={accId ? [accId] : []}
          onValueChange={({ value }) => setAccId(value?.[0])}
          disabled={requisitionAccounts.items.length === 0}
        >
          <SelectLabel />
          <SelectTrigger>
            <SelectValueText placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {requisitionAccounts.items.map((item) => (
              <SelectItem key={item} item={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Field>

      <Box p="2" />

      <Button variant="surface" type="submit" disabled={!accId}>
        Submit
      </Button>
    </form>
  );
}
