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

interface BankAccountReconnectManagerProps {
  accounts: string[];
  requisitionId: string;
  existingAccounts: ExistingAccount[];
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

export default function BankAccountReconnectManager({
  accounts,
  requisitionId,
  existingAccounts
}: BankAccountReconnectManagerProps) {
  const [accountStates, setAccountStates] = useState<Record<string, AccountState>>(
    accounts.reduce((acc, accountId) => ({
      ...acc,
      [accountId]: { action: 'nothing' as AccountAction, loading: true }
    }), {})
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const existingAccountOptions = createListCollection({
    items: existingAccounts.map((account) => ({
      label: `${account.name} (${account.iban})`,
      value: account.id.toString()
    }))
  });

  // Load account details on component mount
  useEffect(() => {
    // If no accounts, redirect immediately
    if (accounts.length === 0) {
      setTimeout(() => {
        router.push('/bank-accounts');
      }, 2000);
      return;
    }

    accounts.forEach(accountId => {
      startTransition(async () => {
        try {
          const details = await getCachedAccountDetails(accountId);
          setAccountStates(prev => ({
            ...prev,
            [accountId]: { 
              ...prev[accountId], 
              details, 
              loading: false,
              // Check if account with this IBAN already exists
              action: existingAccounts.some(existing => existing.iban === details.account.iban) ? 'nothing' : 'register'
            }
          }));
        } catch (error) {
          setAccountStates(prev => ({
            ...prev,
            [accountId]: { 
              ...prev[accountId], 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to load account details'
            }
          }));
        }
      });
    });
  }, [accounts, existingAccounts, router]);

  const updateAccountState = (accountId: string, updates: Partial<AccountState>) => {
    setAccountStates(prev => ({
      ...prev,
      [accountId]: { ...prev[accountId], ...updates }
    }));
  };

  const handleExecuteAllActions = () => {
    startTransition(async () => {
      const accountsToProcess = accounts.filter(accountId => {
        const state = accountStates[accountId];
        return state.details && state.action !== 'nothing' && !state.success;
      });

      for (const accountId of accountsToProcess) {
        const state = accountStates[accountId];
        if (!state.details) continue;

        try {
          if (state.action === 'register') {
            await registerNewBankAccount(accountId, requisitionId, state.customName);
          } else if (state.action === 'merge' && state.mergeTargetId) {
            await mergeWithExistingAccount(accountId, state.mergeTargetId, requisitionId);
          } else {
            // Skip invalid configurations
            continue;
          }
          
          updateAccountState(accountId, { error: undefined, success: true });
        } catch (error) {
          updateAccountState(accountId, { 
            error: error instanceof Error ? error.message : 'Action failed',
            success: false
          });
        }
      }
      
      // Automatically redirect after processing
      setTimeout(() => {
        router.push('/bank-accounts');
      }, 1500);
    });
  };

  const canRegisterNewAccount = (accountId: string) => {
    const state = accountStates[accountId];
    if (!state.details) return false;
    
    // Check if any existing account has the same IBAN
    return !existingAccounts.some(existing => 
      existing.iban === state.details!.account.iban
    );
  };

  // Check if all actions are completed
  const allActionsCompleted = accounts.every(accountId => {
    const state = accountStates[accountId];
    return state.success || state.action === 'nothing';
  });

  const hasAnyActions = accounts.some(accountId => {
    const state = accountStates[accountId];
    return state.action !== 'nothing';
  });

  const canProcessActions = accounts.some(accountId => {
    const state = accountStates[accountId];
    return state.action !== 'nothing' && 
           !state.loading && 
           state.details &&
           (state.action === 'register' || (state.action === 'merge' && state.mergeTargetId));
  });

  const allAccountsLoaded = accounts.every(accountId => {
    const state = accountStates[accountId];
    return !state.loading;
  });

  return (
    <VStack gap={4} align="stretch">
      <Heading size="lg">Discovered Bank Accounts</Heading>
      <Text color="fg.muted">
        Review the accounts discovered from your bank connection and select what to do with each one. 
        Once you&apos;ve made your selections, use the &ldquo;Process All Actions&rdquo; button to apply all changes at once.
      </Text>
      <Box p={3} bg="bg.subtle" rounded="md" fontSize="sm">
        <VStack align="start" gap={1}>
          <Text><strong>Register as new account:</strong> Creates a new bank account entry in the system</Text>
          <Text><strong>Merge with existing account:</strong> Updates an existing account to use the new connection</Text>
          <Text><strong>Do nothing:</strong> Ignores this account for now (you can set it up later)</Text>
        </VStack>
      </Box>

      {allActionsCompleted && hasAnyActions ? (
        <Box p={4} bg="green.50" rounded="md" borderLeft="4px solid" borderColor="green.200">
          <Heading size="sm" color="green.700" mb={2}>All Actions Completed!</Heading>
          <Text color="green.600" mb={4}>
            All selected actions have been completed successfully. Redirecting to bank accounts page...
          </Text>
        </Box>
      ) : allAccountsLoaded && hasAnyActions && (
        <Box p={4} bg="bg.info" rounded="md" borderLeft="4px solid" borderColor="border.info">
          <Heading size="sm" mb={2}>Ready to Process</Heading>
          <Text mb={4}>
            Review your selections above and click the button below to process all actions.
          </Text>
          <Button 
            onClick={handleExecuteAllActions}
            disabled={!canProcessActions || isPending}
            colorPalette="blue"
            size="lg"
          >
            {isPending ? 'Processing accounts...' : 'Process All Actions'}
          </Button>
        </Box>
      )}

      {accounts.map(accountId => {
        const state = accountStates[accountId];
        const canRegister = canRegisterNewAccount(accountId);

        if (state.loading) {
          return (
            <Box key={accountId} borderWidth="1px" rounded="md" p={4}>
              <Text>Loading account details...</Text>
            </Box>
          );
        }

        if (state.error && !state.details) {
          return (
            <Box key={accountId} borderWidth="1px" rounded="md" p={4}>
              <Text color="fg.error">
                Error loading account {accountId}: {state.error}
              </Text>
            </Box>
          );
        }

        if (!state.details) {
          return null;
        }

        const { account } = state.details;
        const existingAccountWithSameIban = existingAccounts.find(
          existing => existing.iban === account.iban
        );

        return (
          <Box key={accountId} borderWidth="1px" rounded="md" p={4} opacity={state.success ? 0.7 : 1}>
            <VStack gap={4} align="stretch">
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Heading size="md">{account.name || account.product}</Heading>
                  <HStack>
                    {state.success && (
                      <Badge colorPalette="green">Completed</Badge>
                    )}
                    <Badge colorPalette={canRegister ? 'green' : 'orange'}>
                      {canRegister ? 'New Account' : 'Existing IBAN'}
                    </Badge>
                  </HStack>
                </HStack>
                <Text><strong>IBAN:</strong> {account.iban}</Text>
                <Text><strong>Owner:</strong> {account.ownerName}</Text>
                <Text><strong>Currency:</strong> {account.currency}</Text>
                {existingAccountWithSameIban && (
                  <Box mt={2} p={3} bg="bg.info" rounded="md" borderLeft="4px solid" borderColor="border.info">
                    <Text>
                      An account with this IBAN already exists: &ldquo;{existingAccountWithSameIban.name}&rdquo;
                    </Text>
                  </Box>
                )}
              </Box>

              {!state.success && (
                <>
                  <Field label="Action">
                    <RadioGroup
                      value={state.action}
                      onValueChange={(value) => 
                        updateAccountState(accountId, { action: value.value as AccountAction })
                      }
                    >
                      <VStack align="start">
                        <Radio value="nothing">Do nothing</Radio>
                        <Radio 
                          value="register" 
                          disabled={!canRegister}
                        >
                          Register as new account
                        </Radio>
                        <Radio value="merge">Merge with existing account</Radio>
                      </VStack>
                    </RadioGroup>
                  </Field>

                  {state.action === 'register' && canRegister && (
                    <Field label="Custom Name (optional)">
                      <Input
                        placeholder={account.name || account.product}
                        value={state.customName || ''}
                        onChange={(e) => 
                          updateAccountState(accountId, { customName: e.target.value })
                        }
                      />
                    </Field>
                  )}

                  {state.action === 'merge' && (
                    <Field label="Merge with existing account">
                      <SelectRoot
                        collection={existingAccountOptions}
                        value={state.mergeTargetId ? [state.mergeTargetId.toString()] : []}
                        onValueChange={(e) => 
                          updateAccountState(accountId, { 
                            mergeTargetId: e.value[0] ? parseInt(e.value[0]) : undefined 
                          })
                        }
                      >
                        <SelectLabel />
                        <SelectTrigger>
                          <SelectValueText placeholder="Select an account to merge with" />
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
                </>
              )}

              {state.error && (
                <Box p={3} bg="red.50" rounded="md" borderLeft="4px solid" borderColor="red.200">
                  <Text color="fg.error">{state.error}</Text>
                </Box>
              )}

              {state.success && (
                <Box p={3} bg="green.50" rounded="md" borderLeft="4px solid" borderColor="green.200">
                  <Text color="green.700">
                    {state.action === 'register' ? 'Account registered successfully!' : 'Account merged successfully!'}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        );
      })}

      {accounts.length === 0 && (
        <Box borderWidth="1px" rounded="md" p={4}>
          <Text>No new accounts found in this requisition.</Text>
          <Text fontSize="sm" color="fg.muted" mt={2}>
            Redirecting to bank accounts page...
          </Text>
        </Box>
      )}
    </VStack>
  );
}
