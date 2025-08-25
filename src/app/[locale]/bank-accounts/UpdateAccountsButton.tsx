'use client';

import { Button } from '@/components/ui/button';
import { refreshAllBankAccounts } from '@/actions/bankAccounts';
import { useCallback, useState } from 'react';
import i18nService from '@/services/i18nService';
import { useRouter } from 'next/navigation';
import { HiRefresh } from 'react-icons/hi';

export default function UpdateAccountsButton({ locale }: { locale: string }) {
  const l = i18nService.getLocale(locale);
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);

  const updateBankAccounts = useCallback(async () => {
    setRefreshing(true);
    await refreshAllBankAccounts();
    router.refresh();
    setRefreshing(false);
  }, [router]);

  return (
    <Button
      variant="surface"
      onClick={updateBankAccounts}
      disabled={refreshing}
    >
      <HiRefresh /> {refreshing ? 'Refreshing' : l.bankAccounts.refresh}
    </Button>
  );
}
