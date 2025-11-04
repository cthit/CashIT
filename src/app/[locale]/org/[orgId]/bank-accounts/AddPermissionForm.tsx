'use client';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { GammaSuperGroup } from '@/types/gamma';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from '@/components/ui/select';
import { Box, createListCollection, Heading } from '@chakra-ui/react';
import { Prisma } from '@prisma/client';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setBankAccountAccess } from '@/actions/bankAccounts';

export default function AddPermissionForm({
  accounts,
  groups,
  selectedAccountId
}: {
  accounts: Prisma.BankAccountGetPayload<{}>[];
  groups: { superGroup: GammaSuperGroup; members: any[]; hasBanner: boolean; hasAvatar: boolean; }[];
  selectedAccountId?: string;
}) {
  const router = useRouter();

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [accId, setAccId] = useState<string | undefined>(selectedAccountId);

  // Load current permissions when account is selected
  useEffect(() => {
    if (accId) {
      const account = accounts.find(a => a.goCardlessId === accId);
      if (account) {
        setSelectedGroups(account.gammaSuperGroupAccesses);
      }
    } else {
      setSelectedGroups([]);
    }
  }, [accId, accounts]);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (accId) {
        await setBankAccountAccess(accId, selectedGroups);
        router.push('/bank-accounts');
      }
    },
    [accId, router, selectedGroups]
  );

  const groupList = useMemo(
    () =>
      createListCollection({
        items: groups.map((g) => {
          return {
            label: g.superGroup.prettyName,
            value: g.superGroup.id
          };
        })
      }),
    [groups]
  );

  const accs = useMemo(
    () =>
      createListCollection({
        items: accounts.map((a) => {
          return {
            label: a.name,
            value: a.goCardlessId
          };
        })
      }),
    [accounts]
  );

  return (
    <form onSubmit={submit}>
      <Heading size="md">Set Account Access</Heading>

      <Field label="Account" required>
        <SelectRoot
          collection={accs}
          value={accId ? [accId] : []}
          onValueChange={({ value }) => setAccId(value?.[0])}
          disabled={accs.items.length === 0}
        >
          <SelectLabel />
          <SelectTrigger>
            <SelectValueText placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {accs.items.map((item) => (
              <SelectItem key={item.value} item={item}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Field>

      <Field label="Super Group(s)">
        <SelectRoot
          multiple
          collection={groupList}
          value={selectedGroups}
          onValueChange={({ value }) => setSelectedGroups(value)}
        >
          <SelectLabel />
          <SelectTrigger>
            <SelectValueText placeholder="Select group(s)" />
          </SelectTrigger>
          <SelectContent>
            {groupList.items.map((acc) => (
              <SelectItem item={acc} key={acc.value}>
                {acc.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Field>

      <Box p="2" />

      <Button variant="surface" type="submit">
        Submit
      </Button>
    </form>
  );
}
