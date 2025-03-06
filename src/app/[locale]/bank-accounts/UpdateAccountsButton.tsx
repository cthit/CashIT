'use client';

import { Button } from '@/components/ui/button';
import { refreshAllBankAccounts } from '@/actions/bankAccounts';
import { useCallback } from 'react';
import i18nService from '@/services/i18nService';

export default function UpdateAccountsButton({ locale }: { locale: string }) {
  const l = i18nService.getLocale(locale);

  const updateBankAccounts = useCallback(() => {
    refreshAllBankAccounts();
  }, []);

  return (
    <Button variant="surface" onClick={updateBankAccounts}>
      {l.bankAccounts.refresh}
    </Button>
  );
}
