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
import i18nService from '@/services/i18nService';
import {
  getCachedAccountDetails,
  registerNewBankAccount,
  mergeWithExistingAccount
} from '@/actions/bankAccounts';
import { registerRequisition } from '@/actions/goCardless';

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

// Props for connect mode (new requisition)
interface ConnectModeProps {
  mode: 'connect';
  requisition: {
    id: string;
    accounts: string[];
  };
  existingAccounts: ExistingAccount[];
}

// Props for reconnect mode (existing requisition)
interface ReconnectModeProps {
  mode: 'reconnect';
  accounts: string[];
  requisitionId: string;
  existingAccounts: ExistingAccount[];
  requisition?: never;
}

type BankAccountManagerProps = (ConnectModeProps | ReconnectModeProps) & {
  orgId: string;
  locale: string;
};

export default function BankAccountManager(props: BankAccountManagerProps) {
  const { mode, existingAccounts, orgId, locale } = props;
  const router = useRouter();
  const l = i18nService.getLocale(locale);

  // Extract accounts and requisitionId based on mode
  const accounts =
    mode === 'connect' ? props.requisition.accounts : props.accounts;
  const requisitionId =
    mode === 'connect' ? props.requisition.id : props.requisitionId;

  const [accountStates, setAccountStates] = useState<
    Record<string, AccountState>
  >(
    accounts.reduce(
      (acc, accountId) => ({
        ...acc,
        [accountId]: { action: 'nothing' as AccountAction, loading: true }
      }),
      {}
    )
  );
  const [isPending, startTransition] = useTransition();

  const existingAccountOptions = createListCollection({
    items: existingAccounts.map((account) => ({
      label: `${account.name} (${account.iban})`,
      value: account.id.toString()
    }))
  });

  // Load data on component mount
  useEffect(() => {
    if (accounts.length === 0) {
      setTimeout(() => {
        router.push(`/org/${orgId}/bank-accounts`);
      }, 2000);
      return;
    }

    // Load account details for all accounts
    accounts.forEach((accountId) => {
      getCachedAccountDetails(accountId)
        .then((details) => {
          setAccountStates((prev) => ({
            ...prev,
            [accountId]: {
              ...prev[accountId],
              details,
              loading: false,
              // Auto-select register action for new accounts if IBAN doesn't exist
              action: existingAccounts.some(
                (acc) => acc.iban === details.account.iban
              )
                ? 'nothing'
                : 'register'
            }
          }));
        })
        .catch((_error) => {
          setAccountStates((prev) => ({
            ...prev,
            [accountId]: {
              ...prev[accountId],
              loading: false,
              error: l.accountManagement.error
            }
          }));
        });
    });
  }, [accounts, requisitionId, mode, router, existingAccounts, orgId, l]);

  const updateAccountState = (
    accountId: string,
    updates: Partial<AccountState>
  ) => {
    setAccountStates((prev) => ({
      ...prev,
      [accountId]: { ...prev[accountId], ...updates }
    }));
  };

  const processAllAccounts = async () => {
    startTransition(async () => {
      await registerRequisition(requisitionId);

      const promises = Object.entries(accountStates).map(
        async ([accountId, state]) => {
          if (state.action === 'nothing' || state.success) {
            return;
          }

          try {
            updateAccountState(accountId, { loading: true, error: undefined });

            if (state.action === 'register' && state.details) {
              const accountName =
                state.customName ||
                state.details.account.name ||
                state.details.account.product;
              await registerNewBankAccount(
                accountId,
                requisitionId,
                accountName
              );
            } else if (state.action === 'merge' && state.mergeTargetId) {
              await mergeWithExistingAccount(
                accountId,
                state.mergeTargetId,
                requisitionId
              );
            }

            updateAccountState(accountId, { loading: false, success: true });
          } catch (error) {
            updateAccountState(accountId, {
              loading: false,
              error:
                error instanceof Error
                  ? error.message
                  : l.accountManagement.operationFailed
            });
          }
        }
      );

      await Promise.allSettled(promises);

      // Check if any actual processing was done
      const hadActionsToProcess = Object.values(accountStates).some(
        (state) => state.action !== 'nothing' && !state.success
      );

      // Auto-redirect - immediate if no actions, delayed if actions were processed
      setTimeout(
        () => {
          router.push(`/org/${orgId}/bank-accounts`);
        },
        hadActionsToProcess ? 1500 : 0
      );
    });
  };

  const canProcess = Object.values(accountStates).some(
    (state) => !state.success && !state.loading
  );

  // Check if any accounts are still loading
  const hasLoadingAccounts = Object.values(accountStates).some(
    (state) => state.loading
  );

  // Check if we've actually processed some accounts (not just set them to "nothing")
  const hasProcessedAccounts = Object.values(accountStates).some(
    (state) => state.success
  );

  // Show success screen only if:
  // 1. No accounts are loading
  // 2. We have actually processed some accounts successfully
  // 3. All accounts that needed processing are done
  const allProcessed =
    !hasLoadingAccounts &&
    hasProcessedAccounts &&
    Object.values(accountStates).every(
      (state) => state.action === 'nothing' || state.success
    );

  // Get appropriate titles and descriptions based on mode
  const getTitle = () => {
    switch (mode) {
      case 'connect':
        return l.accountManagement.newBankConnection;
      case 'reconnect':
        return l.accountManagement.reconnectBankAccounts;
      default:
        return l.accountManagement.manageBankAccounts;
    }
  };

  const getDescription = () => {
    const accountCount = accounts.length;
    const plural =
      accountCount !== 1
        ? l.accountManagement.accounts
        : l.accountManagement.account;

    switch (mode) {
      case 'connect':
        return l.accountManagement.connectDescription
          .replace('{count}', accountCount.toString())
          .replace('{plural}', plural);
      case 'reconnect':
        return l.accountManagement.reconnectDescription
          .replace('{count}', accountCount.toString())
          .replace('{plural}', plural);
      default:
        return l.accountManagement.defaultDescription
          .replace('{count}', accountCount.toString())
          .replace('{plural}', plural);
    }
  };

  if (allProcessed && accounts.length > 0) {
    return (
      <Box textAlign="center" p={8}>
        <Heading size="lg" color="green.600" mb={4}>
          ✅{' '}
          {mode === 'connect'
            ? l.accountManagement.newBankConnection
            : l.accountManagement.reconnectBankAccounts}{' '}
          {l.accountManagement.completedSuccessfully}
        </Heading>
        <Text mb={4}>{l.accountManagement.allAccountsProcessed}</Text>
      </Box>
    );
  }

  return (
    <VStack gap={6} align="stretch" maxW="4xl">
      <Box>
        <Heading size="lg" mb={2}>
          {getTitle()}
        </Heading>
        <Text color="fg.muted">{getDescription()}</Text>
      </Box>

      {accounts.length === 0 && (
        <Box textAlign="center" p={8} bg="bg.muted" rounded="md">
          <Heading size="md" mb={2}>
            {l.bankConnections.noConnectionsFound}
          </Heading>
          <Text color="fg.muted" mb={4}>
            {l.bankConnections.noBankAccountsFound}
          </Text>
          <Text mt={4} color="fg.muted">
            {l.accountManagement.redirectingToAccounts}
          </Text>
        </Box>
      )}

      {accounts.map((accountId) => {
        const state = accountStates[accountId];
        if (!state) return null;

        const existingAccountWithSameIban = existingAccounts.find(
          (acc) => acc.iban === state.details?.account.iban
        );

        return (
          <Box
            key={accountId}
            borderWidth="1px"
            rounded="md"
            p={4}
            bg="bg.subtle"
          >
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" gap={1}>
                  <Text fontWeight="semibold">
                    {state.loading
                      ? l.accountManagement.loadingDetails + '...'
                      : state.details?.account.name ||
                        state.details?.account.product ||
                        accountId}
                  </Text>
                  {state.details && (
                    <Text fontSize="sm" color="fg.muted">
                      {state.details.account.iban}
                    </Text>
                  )}
                </VStack>
                {state.success && (
                  <Badge colorScheme="green">
                    {l.accountManagement.processed}
                  </Badge>
                )}
                {state.error && (
                  <Badge colorScheme="red">{l.accountManagement.error}</Badge>
                )}
              </HStack>

              {state.error && (
                <Box
                  p={3}
                  bg="red.50"
                  rounded="md"
                  borderWidth="1px"
                  borderColor="red.200"
                >
                  <Text color="red.600" fontSize="sm">
                    {state.error}
                  </Text>
                </Box>
              )}

              {!state.loading && !state.success && (
                <Field label={l.accountManagement.whatToDo}>
                  <RadioGroup
                    value={state.action}
                    onValueChange={(details) =>
                      updateAccountState(accountId, {
                        action: details.value as AccountAction
                      })
                    }
                  >
                    <VStack gap={3} align="start">
                      <Radio value="nothing">
                        {l.accountManagement.doNothing}
                      </Radio>

                      <Radio
                        value="register"
                        disabled={!!existingAccountWithSameIban}
                      >
                        <HStack>
                          <Text>{l.accountManagement.registerAsNew}</Text>
                          {existingAccountWithSameIban && (
                            <Badge colorScheme="orange" size="sm">
                              {l.accountManagement.ibanExists}
                            </Badge>
                          )}
                        </HStack>
                      </Radio>

                      {existingAccounts.length > 0 && (
                        <Radio value="merge">
                          {l.accountManagement.mergeWithExisting}
                        </Radio>
                      )}
                    </VStack>
                  </RadioGroup>
                </Field>
              )}

              {state.action === 'register' && !state.success && (
                <Field label={l.accountManagement.accountName}>
                  <Input
                    value={
                      state.customName ||
                      state.details?.account.name ||
                      state.details?.account.product ||
                      ''
                    }
                    onChange={(e) =>
                      updateAccountState(accountId, {
                        customName: e.target.value
                      })
                    }
                    placeholder={l.accountManagement.accountName}
                  />
                </Field>
              )}

              {state.action === 'merge' &&
                existingAccounts.length > 0 &&
                !state.success && (
                  <Field label={l.accountManagement.mergeWithExisting}>
                    <SelectRoot
                      collection={existingAccountOptions}
                      value={
                        state.mergeTargetId
                          ? [state.mergeTargetId.toString()]
                          : []
                      }
                      onValueChange={({ value }) =>
                        updateAccountState(accountId, {
                          mergeTargetId: value?.[0]
                            ? parseInt(value[0])
                            : undefined
                        })
                      }
                    >
                      <SelectLabel />
                      <SelectTrigger>
                        <SelectValueText
                          placeholder={l.accountManagement.chooseAccount}
                        />
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

      {accounts.length > 0 && (
        <HStack justify="space-between" pt={4}>
          <Button
            variant="outline"
            onClick={() => router.push(`/org/${orgId}/bank-accounts`)}
          >
            {l.general.delete}
          </Button>
          <Button
            variant="solid"
            onClick={processAllAccounts}
            disabled={!canProcess || isPending}
          >
            {l.general.save}
          </Button>
        </HStack>
      )}
    </VStack>
  );
}
