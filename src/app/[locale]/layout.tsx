//import localFont from 'next/font/local';
//import './globals.css';
import { Provider } from '@/components/ui/provider';
import Header from '@/components/Header/Header';
import { Container } from '@chakra-ui/react';
import { Metadata } from 'next';

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

  return (
    <html lang={locale}>
      <body>
        <Provider>
          <Header locale={locale} />
          <Container py="6">{children}</Container>
        </Provider>
      </body>
    </html>
  );
}
