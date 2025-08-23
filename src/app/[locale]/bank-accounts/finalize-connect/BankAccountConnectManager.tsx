'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Heading,
  Text,
  Input,
  VStack,
  HStack,
  Badge
} from '@chakra-ui/react';
import { Radio, RadioGroup } from '@/components/ui/radio';
import { Field } from '@/components/ui/field';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from '@/components/ui/select';
import { createListCollection } from '@chakra-ui/react';
import {
  getCachedAccountDetails,
  registerNewBankAccount,
  mergeWithExistingAccount
} from '@/actions/bankAccounts';
import { registerRequisition } from '@/actions/goCardless';
import { Requisition } from '@/services/goCardlessService';

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

interface ExistingAccount {
  id: number;
  name: string;
  iban: string;
  goCardlessId: string;
}

interface BankAccountConnectManagerProps {
  requisition: Requisition;
}

type AccountAction = 'nothing' | 'register' | 'merge';

interface AccountState {
  action: AccountAction;
  customName?: string;
  mergeTargetId?: number;
  details?: AccountDetails;
  loading: boolean;
  error?: string;
  success?: boolean;
}

export default function BankAccountConnectManager({
  requisition
}: BankAccountConnectManagerProps) {
  const [existingAccounts, setExistingAccounts] = useState<ExistingAccount[]>([]);
  const [accountStates, setAccountStates] = useState<Record<string, AccountState>>(
    requisition.accounts.reduce((acc, accountId) => ({
      ...acc,
      [accountId]: { action: 'nothing' as AccountAction, loading: true }
    }), {})
  );
  const [isPending, startTransition] = useTransition();
  const [requisitionRegistered, setRequisitionRegistered] = useState(false);
  const router = useRouter();

  const existingAccountOptions = createListCollection({
    items: existingAccounts.map((account) => ({
      label: `${account.name} (${account.iban})`,
      value: account.id.toString()
    }))
  });

  // Load account details and existing accounts on component mount
  useEffect(() => {
    // First register the requisition
    if (!requisitionRegistered) {
      registerRequisition(requisition.id).then(() => {
        setRequisitionRegistered(true);
      }).catch(error => {
        console.error('Error registering requisition:', error);
      });
    }

    // If no accounts, redirect immediately
    if (requisition.accounts.length === 0) {
      setTimeout(() => {
        router.push('/bank-accounts');
      }, 2000);
      return;
    }

    // Load existing accounts
    fetch('/api/bank-accounts')
      .then(res => res.json())
      .then(accounts => setExistingAccounts(accounts))
      .catch(_error => console.error('Error loading existing accounts:', _error));

    requisition.accounts.forEach(accountId => {
      getCachedAccountDetails(accountId)
        .then(details => {
          setAccountStates(prev => ({
            ...prev,
            [accountId]: {
              ...prev[accountId],
              details,
              loading: false,
              // Auto-select register action for new accounts if IBAN doesn't exist
              action: existingAccounts.some(acc => acc.iban === details.account.iban) ? 'nothing' : 'register'
            }
          }));
        })
        .catch(_error => {
          setAccountStates(prev => ({
            ...prev,
            [accountId]: {
              ...prev[accountId],
              loading: false,
              error: 'Failed to load account details'
            }
          }));
        });
    });
  }, [requisition.accounts, requisition.id, requisitionRegistered, router, existingAccounts]);

  const updateAccountState = (accountId: string, updates: Partial<AccountState>) => {
    setAccountStates(prev => ({
      ...prev,
      [accountId]: { ...prev[accountId], ...updates }
    }));
  };

  const processAllAccounts = async () => {
    startTransition(async () => {
      const promises = Object.entries(accountStates).map(async ([accountId, state]) => {
        if (state.action === 'nothing' || state.success) {
          return;
        }

        try {
          updateAccountState(accountId, { loading: true, error: undefined });

          if (state.action === 'register' && state.details) {
            const accountName = state.customName || state.details.account.name || state.details.account.ownerName;
            await registerNewBankAccount(accountId, requisition.id, accountName);
          } else if (state.action === 'merge' && state.mergeTargetId) {
            await mergeWithExistingAccount(accountId, state.mergeTargetId, requisition.id);
          }

          updateAccountState(accountId, { loading: false, success: true });
        } catch (error) {
          updateAccountState(accountId, { 
            loading: false, 
            error: error instanceof Error ? error.message : 'Operation failed' 
          });
        }
      });

      await Promise.allSettled(promises);

      // Auto-redirect after a short delay
      setTimeout(() => {
        router.push('/bank-accounts');
      }, 1500);
    });
  };

  const canProcess = Object.values(accountStates).some(state => 
    state.action !== 'nothing' && !state.success && !state.loading
  );

  const allProcessed = Object.values(accountStates).every(state => 
    state.action === 'nothing' || state.success
  );

  if (allProcessed && requisition.accounts.length > 0) {
    return (
      <Box textAlign="center" p={8}>
        <Heading size="lg" color="green.600" mb={4}>
          ✅ Connection Completed Successfully!
        </Heading>
        <Text mb={4}>
          All selected accounts have been processed. Redirecting to bank accounts...
        </Text>
      </Box>
    );
  }

  return (
    <VStack gap={6} align="stretch" maxW="4xl">
      <Box>
        <Heading size="lg" mb={2}>New Bank Connection</Heading>
        <Text color="fg.muted">
          Found {requisition.accounts.length} account{requisition.accounts.length !== 1 ? 's' : ''} in your new connection. 
          Choose what to do with each account below, then process all changes at once.
        </Text>
      </Box>

      {requisition.accounts.length === 0 && (
        <Box textAlign="center" p={8} bg="bg.muted" rounded="md">
          <Heading size="md" mb={2}>No Accounts Found</Heading>
          <Text color="fg.muted" mb={4}>
            No bank accounts were found in this connection. This might be due to:
          </Text>
          <VStack gap={2} align="start" display="inline-block">
            <Text>• The bank connection was cancelled</Text>
            <Text>• No accounts were selected during the bank login</Text>
            <Text>• The bank doesn&apos;t support account discovery</Text>
          </VStack>
          <Text mt={4} color="fg.muted">
            Redirecting to bank accounts page...
          </Text>
        </Box>
      )}

      {requisition.accounts.map(accountId => {
        const state = accountStates[accountId];
        if (!state) return null;

        const existingAccountWithSameIban = existingAccounts.find(
          acc => acc.iban === state.details?.account.iban
        );

        return (
          <Box key={accountId} borderWidth="1px" rounded="md" p={4} bg="bg.subtle">
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" gap={1}>
                  <Text fontWeight="semibold">
                    {state.loading ? 'Loading account details...' : (
                      state.details?.account.name || 
                      state.details?.account.ownerName || 
                      accountId
                    )}
                  </Text>
                  {state.details && (
                    <Text fontSize="sm" color="fg.muted">
                      {state.details.account.iban} • {state.details.account.currency}
                    </Text>
                  )}
                </VStack>
                {state.success && (
                  <Badge colorScheme="green">Processed</Badge>
                )}
                {state.error && (
                  <Badge colorScheme="red">Error</Badge>
                )}
              </HStack>

              {state.error && (
                <Box p={3} bg="red.50" rounded="md" borderWidth="1px" borderColor="red.200">
                  <Text color="red.600" fontSize="sm">
                    {state.error}
                  </Text>
                </Box>
              )}

              {!state.loading && !state.success && (
                <Field label="What would you like to do with this account?">
                  <RadioGroup
                    value={state.action}
                    onValueChange={(details) => updateAccountState(accountId, { action: details.value[0] as AccountAction })}
                  >
                    <VStack gap={3} align="start">
                      <Radio value="nothing">
                        Do nothing (skip this account)
                      </Radio>
                      
                      <Radio 
                        value="register" 
                        disabled={!!existingAccountWithSameIban}
                      >
                        <HStack>
                          <Text>Register as new account</Text>
                          {existingAccountWithSameIban && (
                            <Badge colorScheme="orange" size="sm">
                              IBAN already exists
                            </Badge>
                          )}
                        </HStack>
                      </Radio>
                      
                      {existingAccounts.length > 0 && (
                        <Radio value="merge">
                          Merge with existing account (replace GoCardless connection)
                        </Radio>
                      )}
                    </VStack>
                  </RadioGroup>
                </Field>
              )}

              {state.action === 'register' && !state.success && (
                <Field label="Account Name">
                  <Input
                    value={state.customName || state.details?.account.name || state.details?.account.ownerName || ''}
                    onChange={(e) => updateAccountState(accountId, { customName: e.target.value })}
                    placeholder="Enter a name for this account"
                  />
                </Field>
              )}

              {state.action === 'merge' && existingAccounts.length > 0 && !state.success && (
                <Field label="Select account to merge with">
                  <SelectRoot
                    collection={existingAccountOptions}
                    value={state.mergeTargetId ? [state.mergeTargetId.toString()] : []}
                    onValueChange={({ value }) => updateAccountState(accountId, { 
                      mergeTargetId: value?.[0] ? parseInt(value[0]) : undefined 
                    })}
                  >
                    <SelectLabel />
                    <SelectTrigger>
                      <SelectValueText placeholder="Select existing account" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingAccountOptions.items.map((item) => (
                        <SelectItem key={item.value} item={item}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>
              )}
            </VStack>
          </Box>
        );
      })}

      {requisition.accounts.length > 0 && (
        <HStack justify="space-between" pt={4}>
          <Button
            variant="outline"
            onClick={() => router.push('/bank-accounts')}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={processAllAccounts}
            disabled={!canProcess || isPending}
          >
            Process All Accounts
          </Button>
        </HStack>
      )}
    </VStack>
  );
}
