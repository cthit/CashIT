//import localFont from 'next/font/local';
//import './globals.css';
import Header from '@/components/Header/Header';
import { Box, Container, Flex, Heading, Text } from '@chakra-ui/react';
import { Metadata } from 'next';
import SessionService from '@/services/sessionService';
import i18nService from '@/services/i18nService';
import Navigation from '@/components/Navigation/Navigation';

/*const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
});
const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
});*/

export const metadata: Metadata = {
  title: 'CashIT',
  description: 'Economics management system for the IT student division'
};

export default async function RootLayout({
  params,
  children
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const user = await SessionService.getGammaUser();

  return (
    <>
      <Header locale={locale} />
      {user ? (
        <LoggedIn locale={locale}>{children}</LoggedIn>
      ) : (
        <NotLoggedIn locale={locale} />
      )}
    </>
  );
}

const LoggedIn = ({
  children,
  locale
}: Readonly<{ children: React.ReactNode; locale: string }>) => {
  return (
    <Flex direction="row" height="calc(100vh - 4rem)" overflow="hidden">
      <Box
        bg="bg.panel"
        borderRightWidth="1px"
        borderColor="border.emphasized"
        p="4"
        width="20rem"
        display={{ base: 'none', md: 'block' }}
      >
        <Navigation locale={locale} />
      </Box>
      <Box overflowY="scroll" width="100%">
        <Container py="6">{children}</Container>
      </Box>
    </Flex>
  );
};

const NotLoggedIn = ({ locale }: { locale: string }) => {
  const l = i18nService.getLocale(locale);
  return (
    <Container py="6">
      <Heading>{l.account.notLoggedIn}</Heading>
      <Text>{l.account.notLoggedInDesc}</Text>
    </Container>
  );
};
