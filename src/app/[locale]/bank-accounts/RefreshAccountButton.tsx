'use client';

import { refreshBankAccount } from '@/actions/bankAccounts';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiRefresh } from 'react-icons/hi';
import { IconButton } from '@chakra-ui/react';

export default function RefreshAccountButton({
  accountId,
  size = 'sm',
  variant = 'ghost'
}: {
  accountId: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'solid';
}) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshBankAccount(accountId);
      router.refresh();
    } catch (error) {
      console.error('Failed to refresh account:', error);
    } finally {
      setRefreshing(false);
    }
  }, [accountId, router]);

  return (
    <IconButton
      margin='0'
      size={size}
      variant={variant}
      onClick={handleRefresh}
      disabled={refreshing}
    >
      <HiRefresh />
    </IconButton>
  );
}
