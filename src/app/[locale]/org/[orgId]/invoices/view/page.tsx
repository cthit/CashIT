import { notFound } from 'next/navigation';
import SessionService from '@/services/sessionService';
import Link from 'next/link';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import {
  Box,
  Fieldset,
  Heading,
  Separator,
  Table,
  Text
} from '@chakra-ui/react';
import i18nService from '@/services/i18nService';
import InvoiceService from '@/services/invoiceService';
import OrgService from '@/services/orgService';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { InvoiceItemVat } from '@prisma/client';

export default async function Page(props: {
  searchParams: Promise<{ id?: string }>;
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { locale, orgId } = await props.params;
  const l = i18nService.getLocale(locale);

  const { id } = await props.searchParams;
  if (id === undefined) notFound();

  const invoice = await InvoiceService.getById(+id);
  if (invoice === null) notFound();
  const personal = invoice.gammaGroupId === null;

  const divisionTreasurer = await SessionService.isDivisionTreasurer();

  const group =
    !personal && !divisionTreasurer
      ? (await SessionService.getGroups()).find(
          (g) => g.group.id === invoice.gammaGroupId
        )?.group
      : undefined;

  if (!personal && !divisionTreasurer && group === undefined) {
    notFound();
  }

  const user = (await SessionService.getGammaUser())?.user;
  const canEdit =
    divisionTreasurer ||
    group !== undefined ||
    user?.id === invoice.gammaUserId;

  const groups = (await SessionService.getGroups()).map((g) => g.group);

  const org = await OrgService.getById(+orgId);
  if (!org) {
    notFound();
  }

  const selectedGroup = invoice.gammaGroupId
    ? groups.find((g) => g.id === invoice.gammaGroupId)
    : null;

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href={`/org/${orgId}`}>
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href={`/org/${orgId}/invoices`}>
          {l.categories.invoices}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.general.view}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      {canEdit && (
        <Box mb="4">
          <Button asChild colorPalette="cyan">
            <Link href={`/org/${orgId}/invoices/edit?id=${id}`}>
              {l.general.edit}
            </Link>
          </Button>
        </Box>
      )}
      <Fieldset.Root maxW="md" size="lg">
        <Fieldset.Legend>
          <Heading size="lg">{l.expense.invoice}</Heading>
        </Fieldset.Legend>
        <Fieldset.Content mt="0.25rem">
          <Field label={l.group.group}>
            <Text>
              {selectedGroup ? selectedGroup.prettyName : l.group.personal}
            </Text>
          </Field>

          <Field label={l.general.description}>
            <Text>{invoice.name}</Text>
          </Field>

          <Field label={l.general.comment}>
            <Text>{invoice.description || l.general.none}</Text>
          </Field>

          <Box p="2" />
        </Fieldset.Content>
      </Fieldset.Root>

      <Fieldset.Root maxW="md" size="lg">
        <Fieldset.Legend>{l.invoice.details}</Fieldset.Legend>
        <Fieldset.Content mt="0.25rem">
          <Separator />
          <Field label={l.invoice.customerName}>
            <Text>{invoice.customerName}</Text>
          </Field>

          <Field label={l.invoice.dateOfDelivery}>
            <Text>
              {invoice.deliveryDate
                ? invoice.deliveryDate.toLocaleDateString(locale)
                : l.general.none}
            </Text>
          </Field>

          <Field label={l.invoice.invoiceDate}>
            <Text>
              {invoice.sentAt
                ? invoice.sentAt.toLocaleDateString(locale)
                : l.invoice.notSent}
            </Text>
          </Field>

          <Field label={l.invoice.ourReference}>
            <Text>{user?.firstName + ' ' + user?.lastName}</Text>
          </Field>

          <Field label={l.invoice.customersReference}>
            <Text>{invoice.customerReference || l.general.none}</Text>
          </Field>

          <Field label={l.invoice.referenceCode}>
            <Text>{invoice.customerReferenceCode || l.general.none}</Text>
          </Field>

          <Field label={l.invoice.subscriptionNumber}>
            <Text>{invoice.customerSubscriptionNumber || l.general.none}</Text>
          </Field>

          <Field label={l.invoice.customerOrderReference}>
            <Text>{invoice.customerOrderReference || l.general.none}</Text>
          </Field>

          <Field label={l.invoice.contractNumber}>
            <Text>{invoice.customerContractNumber || l.general.none}</Text>
          </Field>

          <Box p="2" />
        </Fieldset.Content>
      </Fieldset.Root>

      <Fieldset.Root size="lg">
        <Fieldset.Content mt="0.25rem">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{l.invoice.item}</Table.ColumnHeader>
                <Table.ColumnHeader>{l.invoice.quantity}</Table.ColumnHeader>
                <Table.ColumnHeader>{l.economy.unitPrice}</Table.ColumnHeader>
                <Table.ColumnHeader>{l.economy.vat}</Table.ColumnHeader>
                <Table.ColumnHeader>{l.invoice.subtotal}</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {invoice.items.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Cell py="1">
                    <Text>{item.name}</Text>
                  </Table.Cell>

                  <Table.Cell py="1">
                    <Text>{item.count}</Text>
                  </Table.Cell>

                  <Table.Cell py="1">
                    <Text>{item.amount} kr</Text>
                  </Table.Cell>

                  <Table.Cell py="1">
                    <Text>
                      {item.vat === InvoiceItemVat.VAT_0 && '0%'}
                      {item.vat === InvoiceItemVat.VAT_6 && '6%'}
                      {item.vat === InvoiceItemVat.VAT_12 && '12%'}
                      {item.vat === InvoiceItemVat.VAT_25 && '25%'}
                    </Text>
                  </Table.Cell>

                  <Table.Cell py="1">
                    <Text>
                      {InvoiceService.calculateSumForItems([item]).toFixed(2)}{' '}
                      kr
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          <Text textAlign="right">
            {l.economy.amountTotal}:{' '}
            {InvoiceService.calculateSumForItems(invoice.items).toFixed(2)} kr
          </Text>
        </Fieldset.Content>
      </Fieldset.Root>
    </>
  );
}
