'use client';

import { Button } from '@/components/ui/button';
import { deleteBankAccount } from '@/actions/bankAccounts';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
    <Button variant="surface" onClick={submit}>
      Delete
    </Button>
  );
}
