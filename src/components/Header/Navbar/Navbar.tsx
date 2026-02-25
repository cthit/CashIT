import SessionService from '@/services/sessionService';
import LoginButton from '../../LoginButton/LoginButton';
import LogoutButton from '../../LogoutButton/LogoutButton';
import i18nService from '@/services/i18nService';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { Box, Flex, IconButton, Span } from '@chakra-ui/react';
import { HiCog } from 'react-icons/hi';
import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = async ({ locale }: { locale: string }) => {
  const l = i18nService.getLocale(locale);
  const user = await SessionService.getUser();
  return (
    <Flex alignItems="center" gap="0.5rem">
      <LanguageSwitcher locale={locale} />
      {user ? (
        <>
          <Span className={styles.greeting}>
            {l.header.greeting} {user.name}!{' '}
          </Span>
          <Box>
            <Link href="/user-settings">
              <IconButton variant="ghost" size="md">
                <HiCog />
              </IconButton>
            </Link>
            <LogoutButton />
          </Box>
        </>
      ) : (
        <LoginButton locale={locale} />
      )}
    </Flex>
  );
};

export default Navbar;
