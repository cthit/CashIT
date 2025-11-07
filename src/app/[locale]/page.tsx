import { Box, Heading } from '@chakra-ui/react';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import OrgService from '@/services/orgService';

export default async function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const organizations = await OrgService.getAll();

  return (
    <>
      <Heading as="h1" size="xl" display="inline" mr="auto">
        Choose an organization
      </Heading>
      <Box p="2" />
      <Box p="2" />
      <ul>
        {organizations.map((org) => (
          <li key={org.id}>
            <Link href={`/org/${org.id}`}>{org.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
