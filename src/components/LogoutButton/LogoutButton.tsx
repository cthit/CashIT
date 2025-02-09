'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import i18nService from '@/services/i18nService';

const LogoutButton = ({ locale }: { locale: string }) => {
  const l = i18nService.getLocale(locale);
  return (
    <Button variant="surface" size="sm" onClick={() => signOut()}>
      {l.header.logout}
    </Button>
  );
};

export default LogoutButton;
