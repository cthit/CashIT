import { notFound } from 'next/navigation';
import { Box, Fieldset, Heading, Text } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import ZettleSaleService from '@/services/zettleSaleService';
import SessionService from '@/services/sessionService';
import OrgService from '@/services/orgService';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';

export default async function Page(props: {
  searchParams: Promise<{ id?: string }>;
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { locale, orgId } = await props.params;
  const l = i18nService.getLocale(locale);

  const { id } = await props.searchParams;
  if (id === undefined) {
    notFound();
  }

  const sale = await ZettleSaleService.getById(+id);
  if (sale === null) {
    notFound();
  }

  const [divisionTreasurer, localAdmin] = await Promise.all([
    SessionService.isDivisionTreasurer(),
    SessionService.isOrgLocalAdmin(+orgId)
  ]);
  const isAdmin = divisionTreasurer || localAdmin;

  const groups = (await SessionService.getGroups()).map((g) => g.group);

  const user = (await SessionService.getGammaUser())?.user;
  const canEdit = isAdmin || user?.id === sale.gammaUserId;

  const org = await OrgService.getById(+orgId);
  if (!org) {
    notFound();
  }

  const selectedGroup = groups.find((g) => g.id === sale.gammaGroupId);

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href={`/org/${orgId}`}>
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href={`/org/${orgId}/zettle-sales`}>
          {l.home.zettleSales}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.general.view}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      {canEdit && (
        <Box mb="4">
          <Button asChild colorPalette="cyan">
            <Link href={`/org/${orgId}/zettle-sales/edit?id=${id}`}>
              {l.general.edit}
            </Link>
          </Button>
        </Box>
      )}
      <Fieldset.Root>
        <Fieldset.Legend>
          <Heading size="lg">{l.zettleSales.zettleSale}</Heading>
        </Fieldset.Legend>
        <Fieldset.Content mt="0.25rem">
          <Field label={l.group.group}>
            <Text>{selectedGroup?.prettyName || l.general.unknown}</Text>
          </Field>

          <Field label={l.general.description}>
            <Text>{sale.name}</Text>
          </Field>

          <Field label={l.economy.date}>
            <Text>{sale.saleDate.toLocaleDateString(locale)}</Text>
          </Field>

          <Field label={l.economy.amountTotal}>
            <Text>{sale.amount} kr</Text>
          </Field>

          <Field label={l.general.comment}>
            <Text>{sale.description || l.general.none}</Text>
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </>
  );
}
