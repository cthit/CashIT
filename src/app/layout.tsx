//import localFont from 'next/font/local';
//import './globals.css';
import { Provider } from '@/components/ui/provider';
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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
