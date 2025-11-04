import { notFound } from 'next/navigation';

export default async function RootLayout({
  params,
  children
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}>) {
  const { orgId } = await params;
  
  // Check if orgId is a positive integer
  if (orgId === ""  || isNaN(Number(orgId)) || Number(orgId) < 0) {
    notFound();
  }

  return children;
}
