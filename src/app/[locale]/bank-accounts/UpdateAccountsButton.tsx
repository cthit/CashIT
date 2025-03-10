'use client';

import { Button } from '@/components/ui/button';
import { refreshAllBankAccounts } from '@/actions/bankAccounts';
import { useCallback } from 'react';
import i18nService from '@/services/i18nService';
import { useRouter } from 'next/navigation';

export default function UpdateAccountsButton({ locale }: { locale: string }) {
  const l = i18nService.getLocale(locale);
  const router = useRouter();

  const updateBankAccounts = useCallback(async () => {
    await refreshAllBankAccounts();
    router.refresh();
  }, [router]);

  return (
    <Button variant="surface" onClick={updateBankAccounts}>
      {l.bankAccounts.refresh}
    </Button>
  );
}
