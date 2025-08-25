'use client';

import { registerBankAccount } from '@/actions/goCardless';
import { getCachedAccountDetails } from '@/actions/bankAccounts';
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
import { Box, createListCollection, Text } from '@chakra-ui/react';
import { Prisma } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';

interface AccountDetails {
  account: {
    resourceId: string;
    iban: string;
    currency: string;
    ownerName: string;
    name?: string;
    product: string;
    cashAccountType: string;
  };
}

interface AccountOption {
  id: string;
  label: string;
  value: string;
  details?: AccountDetails;
  loading?: boolean;
  error?: string;
}

export default function AddAccountForm({
  requisition,
  accounts
}: {
  requisition: Requisition;
  accounts: Prisma.BankAccountGetPayload<{}>[];
}) {
  const router = useRouter();
  const [accId, setAccId] = useState<string | undefined>();
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter out accounts that are already registered locally
  const availableAccountIds = useMemo(
    () =>
      requisition?.accounts?.filter(
        (accountId) =>
          !accounts.find(
            (localAccount) => localAccount.goCardlessId === accountId
          )
      ) ?? [],
    [requisition?.accounts, accounts]
  );

  useEffect(() => {
    const loadAccountDetails = async () => {
      setIsLoading(true);

      const optionsPromises = availableAccountIds.map(async (accountId) => {
        try {
          const details = await getCachedAccountDetails(accountId);
          const accountName = details.account.name ?? details.account.product;

          return {
            id: accountId,
            label: accountName,
            value: accountId,
            details
          };
        } catch (error) {
          console.error(
            `Failed to load details for account ${accountId}:`,
            error
          );
          return {
            id: accountId,
            label: `Account ${accountId.substring(
              0,
              8
            )}... (Unable to load details)`,
            value: accountId,
            error: 'Failed to load account details'
          };
        }
      });

      const resolvedOptions = await Promise.all(optionsPromises);
      setAccountOptions(resolvedOptions);
      setIsLoading(false);
    };

    if (availableAccountIds.length > 0) {
      loadAccountDetails();
    } else {
      setIsLoading(false);
    }
  }, [availableAccountIds]);

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

  const requisitionAccounts = createListCollection({
    items: accountOptions.map((option) => ({
      label: option.label,
      value: option.value
    }))
  });

  if (isLoading) {
    return (
      <Box
        p={6}
        bg="bg.subtle"
        rounded="md"
        borderWidth="1px"
        textAlign="center"
      >
        <Text fontSize="lg" mb={2}>
          Loading Available Accounts...
        </Text>
        <Text color="fg.muted">
          Fetching account details from your bank connection.
        </Text>
      </Box>
    );
  }

  if (availableAccountIds.length === 0) {
    return (
      <Box
        p={6}
        bg="bg.subtle"
        rounded="md"
        borderWidth="1px"
        textAlign="center"
      >
        <Text fontSize="lg" mb={2}>
          No New Accounts Available
        </Text>
        <Text color="fg.muted" mb={4}>
          All accounts from this bank connection have already been registered in
          the system.
        </Text>
        <Text color="fg.muted" fontSize="sm">
          You can view your existing accounts on the main bank accounts page.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text color="fg.muted" mb={4}>
        Select an account from your bank connection to add to the system. You
        can then set permissions and start managing transactions for this
        account.
      </Text>

      <form onSubmit={submit}>
        <Field label="Select Account" required>
          <SelectRoot
            collection={requisitionAccounts}
            value={accId ? [accId] : []}
            onValueChange={({ value }) => setAccId(value?.[0])}
            disabled={requisitionAccounts.items.length === 0}
          >
            <SelectLabel />
            <SelectTrigger>
              <SelectValueText placeholder="Choose an account to add" />
            </SelectTrigger>
            <SelectContent>
              {requisitionAccounts.items.map((item) => (
                <SelectItem key={item.value} item={item}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </Field>

        <Box p="2" />

        <Button variant="surface" type="submit" disabled={!accId}>
          Add Account
        </Button>
      </form>
    </Box>
  );
}
