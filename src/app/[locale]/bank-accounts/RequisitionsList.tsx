import GoCardlessService from '@/services/goCardlessService';
import GammaService from '@/services/gammaService';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Flex
} from '@chakra-ui/react';
import Link from 'next/link';
import { HiLink, HiPlus, HiCog } from 'react-icons/hi';
import RefreshAccountButton from './RefreshAccountButton';
import DeleteRequisitionButton from './DeleteRequisitionButton';

const RequisitionsList = ({
  requisitions,
  groups: _groups,
  locale
}: {
  requisitions: Awaited<
    ReturnType<typeof GoCardlessService.getRegisteredRequisitions>
  >;
  groups: Awaited<ReturnType<typeof GammaService.getAllSuperGroups>>;
  locale: string;
}) => {
  return (
    <VStack gap={4} align="stretch">
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <Heading as="h1" size="xl">
          Bank Account Connections
        </Heading>
        <Link href="/bank-accounts/connect">
          <Button colorPalette="cyan">
            <HiPlus />
            Add bank connection
          </Button>
        </Link>
      </Flex>

      {requisitions.length === 0 ? (
        <Box
          p={6}
          bg="bg.subtle"
          rounded="md"
          borderWidth="1px"
          textAlign="center"
        >
          <Text fontSize="lg" mb={2}>
            No bank connections found
          </Text>
          <Text color="fg.muted" mb={4}>
            Connect your first bank account to get started with managing your
            finances.
          </Text>
          <Link href="/bank-accounts/connect">
            <Button colorPalette="blue">
              <HiPlus />
              Connect First Bank Account
            </Button>
          </Link>
        </Box>
      ) : (
        <VStack gap={4} align="stretch">
          {requisitions.map((requisition) => {
            const totalAvailable = requisition.bankAccounts.reduce(
              (sum, account) => sum + account.balanceAvailable,
              0
            );
            const totalBooked = requisition.bankAccounts.reduce(
              (sum, account) => sum + account.balanceBooked,
              0
            );

            return (
              <Box
                key={requisition.id}
                borderWidth="1px"
                rounded="md"
                p={4}
                bg="bg.subtle"
              >
                <VStack gap={4} align="stretch">
                  {/* Requisition header */}
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={1}>
                      <Heading size="md">Connection #{requisition.id}</Heading>
                      <Text fontSize="sm" color="fg.muted">
                        GoCardless ID: {requisition.goCardlessId}
                      </Text>
                    </VStack>
                    <HStack>
                      <Link
                        href={
                          '/bank-accounts/reconnect?requisition=' +
                          requisition.goCardlessId
                        }
                      >
                        <Button
                          size="sm"
                          colorPalette="orange"
                          variant="outline"
                        >
                          <HiLink />
                          Reconnect
                        </Button>
                      </Link>
                      <Link
                        href={
                          '/bank-accounts/add-account?requisition=' +
                          requisition.goCardlessId
                        }
                      >
                        <Button size="sm" variant="outline">
                          <HiPlus />
                          Add Account
                        </Button>
                      </Link>
                      <DeleteRequisitionButton
                        requisitionId={requisition.goCardlessId}
                        accountCount={requisition.bankAccounts.length}
                      />
                    </HStack>
                  </HStack>

                  {/* Requisition totals */}
                  <Box p={3} bg="bg.muted" rounded="md">
                    <HStack gap={6}>
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="fg.muted">
                          Available
                        </Text>
                        <Text fontWeight="semibold" color="green.600">
                          {new Intl.NumberFormat('sv-SE').format(
                            totalAvailable
                          )}
                        </Text>
                      </VStack>
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="fg.muted">
                          Booked
                        </Text>
                        <Text fontWeight="semibold">
                          {new Intl.NumberFormat('sv-SE').format(totalBooked)}
                        </Text>
                      </VStack>
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="fg.muted">
                          Accounts
                        </Text>
                        <Text fontWeight="semibold">
                          {requisition.bankAccounts.length}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Bank accounts */}
                  {requisition.bankAccounts.length > 0 ? (
                    <VStack gap={2} align="stretch">
                      {requisition.bankAccounts.map((account) => (
                        <Box
                          key={account.id}
                          borderWidth="1px"
                          rounded="md"
                          p={3}
                          bg="bg.default"
                        >
                          <HStack justify="space-between" align="start">
                            <VStack align="start" gap={1}>
                              <HStack>
                                <Text fontWeight="semibold">
                                  {account.name}
                                </Text>
                                {account.gammaSuperGroupAccesses.length > 0 ? (
                                  <Badge colorPalette="green" size="sm">
                                    {account.gammaSuperGroupAccesses.length}{' '}
                                    group
                                    {account.gammaSuperGroupAccesses.length !==
                                    1
                                      ? 's'
                                      : ''}
                                  </Badge>
                                ) : (
                                  <Badge colorPalette="orange" size="sm">
                                    No permissions
                                  </Badge>
                                )}
                              </HStack>
                              <Text fontSize="sm" color="fg.muted">
                                {account.iban}
                              </Text>
                              <HStack gap={4}>
                                <Text fontSize="sm">
                                  Available:{' '}
                                  <Text
                                    as="span"
                                    fontWeight="semibold"
                                    color="green.600"
                                  >
                                    {new Intl.NumberFormat('sv-SE').format(
                                      account.balanceAvailable
                                    )}
                                  </Text>
                                </Text>
                                <Text fontSize="sm">
                                  Booked:{' '}
                                  <Text as="span" fontWeight="semibold">
                                    {new Intl.NumberFormat('sv-SE').format(
                                      account.balanceBooked
                                    )}
                                  </Text>
                                </Text>
                              </HStack>
                            </VStack>
                            <HStack>
                              <RefreshAccountButton accountId={account.id} />
                              <Link
                                href={`/bank-accounts/permissions?account=${account.goCardlessId}`}
                              >
                                <Button size="sm" variant="ghost">
                                  <HiCog />
                                  Permissions
                                </Button>
                              </Link>
                            </HStack>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Box p={4} bg="bg.muted" rounded="md" textAlign="center">
                      <Text color="fg.muted">
                        No bank accounts found in this connection
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            );
          })}
        </VStack>
      )}
    </VStack>
  );
};

export default RequisitionsList;
