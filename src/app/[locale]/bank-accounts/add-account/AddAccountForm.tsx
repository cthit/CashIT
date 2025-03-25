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
  requisitions,
  accounts
}: {
  requisitions: Requisition[];
  accounts: Prisma.BankAccountGetPayload<{}>[];
}) {
  const router = useRouter();
  const [reqId, setReqId] = useState<string | undefined>();
  const [accId, setAccId] = useState<string | undefined>();

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (accId && reqId) {
        await registerBankAccount(accId, reqId);
        router.push('/bank-accounts');
      }
    },
    [accId, reqId, router]
  );

  const reqs = useMemo(
    () =>
      createListCollection({
        items: requisitions.map((r) => {
          return {
            label: r.reference,
            value: r.id
          };
        })
      }),
    [requisitions]
  );

  const selectedRequisition = useMemo(
    () => requisitions.find((r) => r.id === reqId),
    [reqId, requisitions]
  );
  const requisitionAccounts = useMemo(
    () =>
      createListCollection({
        items:
          selectedRequisition?.accounts?.filter(
            (a) => !accounts.find((b) => b.goCardlessId === a)
          ) ?? []
      }),
    [selectedRequisition, accounts]
  );

  return (
    <form onSubmit={submit}>
      <Field label="Requisition" required>
        <SelectRoot
          collection={reqs}
          value={reqId ? [reqId] : []}
          onValueChange={({ value }) => {
            setReqId(value?.[0]);
            setAccId(undefined);
          }}
        >
          <SelectLabel />
          <SelectTrigger>
            <SelectValueText placeholder="Select a requisition" />
          </SelectTrigger>
          <SelectContent>
            {reqs.items.map((item) => (
              <SelectItem key={item.value} item={item}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Field>

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

      <Button variant="surface" type="submit" disabled={!accId || !reqId}>
        Submit
      </Button>
    </form>
  );
}
