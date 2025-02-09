import SessionService from '@/services/sessionService';
import LoginButton from '../../LoginButton/LoginButton';
import LogoutButton from '../../LogoutButton/LogoutButton';
import i18nService from '@/services/i18nService';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { Flex } from '@chakra-ui/react';

const Navbar = async ({ locale }: { locale: string }) => {
  const l = i18nService.getLocale(locale);
  const user = await SessionService.getUser();
  return (
    <Flex alignItems="center" gap="1rem">
      <LanguageSwitcher locale={locale} />
      {user ? (
        <>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {l.header.greeting} {user.name}!
          </span>
          <LogoutButton locale={locale} />
        </>
      ) : (
        <LoginButton locale={locale} />
      )}
    </Flex>
  );
};

export default Navbar;
