'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import i18nService from '@/services/i18nService';

const LoginButton = ({ locale }: { locale: string }) => {
  const l = i18nService.getLocale(locale);
  return (
    <Button
      variant="surface"
      size="sm"
      type="submit"
      onClick={() => signIn('gamma')}
    >
      {l.header.login}
    </Button>
  );
};

export default LoginButton;
