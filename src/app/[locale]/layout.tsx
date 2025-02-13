//import localFont from 'next/font/local';
//import './globals.css';
import Header from '@/components/Header/Header';
import { Container, Heading, Text } from '@chakra-ui/react';
import { Metadata } from 'next';
import SessionService from '@/services/sessionService';
import i18nService from '@/services/i18nService';

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
      <Container py="6">
        {user ? children : <NotLoggedIn locale={locale} />}
      </Container>
    </>
  );
}

const NotLoggedIn = ({ locale }: { locale: string }) => {
  const l = i18nService.getLocale(locale);
  return (
    <>
      <Heading>{l.account.notLoggedIn}</Heading>
      <Text>{l.account.notLoggedInDesc}</Text>
    </>
  );
};
