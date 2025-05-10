import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import i18nService from '@/services/i18nService';
import { Box, Heading } from '@chakra-ui/react';
import Link from 'next/link';

export default async function Home(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>Receipt Creator</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      <Box>
        <Heading as="h1" size="xl" display="inline" mr="auto">
          Receipt Creator
        </Heading>
      </Box>
      <Box p="1" />
    </>
  );
}
