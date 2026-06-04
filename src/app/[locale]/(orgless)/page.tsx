import { Box, Heading, Span } from '@chakra-ui/react';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import OrgService from '@/services/orgService';
import { MdOutlineArrowForwardIos } from 'react-icons/md';

export default async function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const organizations = await OrgService.getAll();

  return (
    <>
      <Heading as="h1" size="xl" display="inline" mr="auto">
        {l.navigation.chooseOrganization}
      </Heading>
      <Box p="2" />
      <Box p="2" />
      <ul>
        {organizations.map((org) => (
          <Box
            asChild
            key={org.id}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb="2"
            maxW="24rem"
            p="2"
            borderWidth="1px"
            borderRadius="md"
            _hover={{ bg: 'bg.subtle' }}
          >
            <Link href={`/org/${org.id}`}>
              <Span>{org.name}</Span>
              <MdOutlineArrowForwardIos />
            </Link>
          </Box>
        ))}
      </ul>
    </>
  );
}
