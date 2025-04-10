'use client';

import { deleteBankAccount } from '@/actions/bankAccounts';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { IconButton } from '@chakra-ui/react';
import { HiTrash } from 'react-icons/hi';

export default function UpdateAccountsButton({
  goCardlessId
}: {
  goCardlessId: string;
}) {
  const router = useRouter();

  const submit = useCallback(() => {
    deleteBankAccount(goCardlessId);
    router.refresh();
  }, [goCardlessId, router]);

  return (
    <IconButton variant="surface" size="sm" onClick={submit}>
      <HiTrash />
    </IconButton>
  );
}
