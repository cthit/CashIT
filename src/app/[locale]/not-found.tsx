import { Heading, Text } from '@chakra-ui/react';

export default async function Home() {
  //const { locale } = await props.params;
  //const l = i18nService.getLocale(locale);

  return (
    <>
      <Heading as="h1" size="xl">
        404
      </Heading>
      <Text>This page was not found</Text>
    </>
  );
}
