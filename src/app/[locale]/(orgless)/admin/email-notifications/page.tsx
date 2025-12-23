import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import SessionService from '@/services/sessionService';
import { notFound } from 'next/navigation';
import OrgService from '@/services/orgService';
import { Button } from '@/components/ui/button';
import { HiPlus } from 'react-icons/hi';
import SendEmailNotificationsButton from './SendEmailNotificationsButton';

export default async function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  const divisionTreasurer = await SessionService.isDivisionTreasurer();
  if (!divisionTreasurer) {
    notFound();
  }

  const { locale } = await props.params;
  const l = i18nService.getLocale(locale);

  const organizations = await OrgService.getAll();

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href="/">
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>Email Notifications</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />

      <Heading as="h1" size="xl">
        Email Notifications
      </Heading>

      <SendEmailNotificationsButton />
    </>
  );
}
