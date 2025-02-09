'use client';

import { useCallback, useState } from 'react';
import {
  Box,
  Fieldset,
  Input,
  Separator,
  Textarea,
  Heading,
  Card,
  createListCollection,
  IconButton,
  Text
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { GammaUser } from '@/types/gamma';
import {
  createInvoiceForGroup,
  createPersonalInvoice,
  editInvoiceForGroup,
  editPersonalInvoice
} from '@/actions/invoices';
import { useRouter } from 'next/navigation';
import { InvoiceItemVat, Prisma } from '@prisma/client';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from '@/components/ui/select';
import { HiPlus, HiTrash } from 'react-icons/hi';
import InvoiceService from '@/services/invoiceService';
import i18nService from '@/services/i18nService';

type FormInvoiceItem = {
  id?: string;
  name: string;
  amount: string;
  count: string;
  vat: InvoiceItemVat;
};

const vatTypes = createListCollection({
  items: [
    { label: '0%', value: InvoiceItemVat.VAT_0 },
    { label: '6%', value: InvoiceItemVat.VAT_6 },
    { label: '12%', value: InvoiceItemVat.VAT_12 },
    { label: '25%', value: InvoiceItemVat.VAT_25 }
  ]
});

const formToInvoiceItem = (item: FormInvoiceItem) =>
  ({
    name: item.name,
    amount: +item.amount,
    count: +item.count,
    vat: item.vat
  } satisfies Prisma.InvoiceItemCreateInput);

const invoiceToForm = (item: Prisma.InvoiceItemGetPayload<{}>) =>
  ({
    name: item.name,
    amount: item.amount + '',
    count: item.count + '',
    vat: item.vat
  } satisfies FormInvoiceItem);

export default function SendInvoiceForm({
  locale,
  gid,
  user,
  i
}: {
  locale: string;
  gid?: string;
  user?: GammaUser;
  i?: Prisma.InvoiceGetPayload<{ include: { items: true } }>;
}) {
  const l = i18nService.getLocale(locale);
  const editing = i !== undefined;

  const router = useRouter();

  const [name, setName] = useState<string>(i?.name ?? '');
  const [comments, setComments] = useState<string>(i?.description ?? '');

  const [customerName, setCustomerName] = useState<string>(
    i?.customerName ?? ''
  );
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  // const [invoiceDate, setInvoiceDate] = useState<string>('');
  // const [ourReference, setOurReference] = useState<string>('');
  const [customerReference, setCustomerReference] = useState<string>(
    i?.customerReference ?? ''
  );
  const [referenceCode, setReferenceCode] = useState<string>(
    i?.customerReferenceCode ?? ''
  );
  const [subscriptionNumber, setSubscriptionNumber] = useState<string>(
    i?.customerSubscriptionNumber ?? ''
  );
  const [customerOrderReference, setCustomerOrderReference] = useState<string>(
    i?.customerOrderReference ?? ''
  );
  const [contractNumber, setContractNumber] = useState<string>(
    i?.customerContractNumber ?? ''
  );

  const [items, setItems] = useState<FormInvoiceItem[]>(
    i?.items?.map((item) => invoiceToForm(item)) ?? []
  );

  const createExpense = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      gid
        ? (editing
            ? editInvoiceForGroup(
                i.id,
                gid,
                name,
                customerName,
                comments,
                items.map((i) => formToInvoiceItem(i)),
                new Date(),
                customerReference,
                referenceCode,
                subscriptionNumber,
                customerOrderReference,
                contractNumber
              )
            : createInvoiceForGroup(
                gid,
                name,
                customerName,
                comments,
                items.map((i) => formToInvoiceItem(i)),
                new Date(),
                customerReference,
                referenceCode,
                subscriptionNumber,
                customerOrderReference,
                contractNumber
              )
          ).then(() => router.push(`/invoices?gid=${gid}`))
        : (editing
            ? editPersonalInvoice(
                i.id,
                name,
                customerName,
                comments,
                items.map((i) => formToInvoiceItem(i)),
                new Date(),
                customerReference,
                referenceCode,
                subscriptionNumber,
                customerOrderReference,
                contractNumber
              )
            : createPersonalInvoice(
                name,
                customerName,
                comments,
                items.map((i) => formToInvoiceItem(i)),
                new Date(),
                customerReference,
                referenceCode,
                subscriptionNumber,
                customerOrderReference,
                contractNumber
              )
          ).then(() => router.push('/invoices'));
    },
    [
      comments,
      contractNumber,
      customerName,
      customerOrderReference,
      customerReference,
      editing,
      gid,
      i,
      items,
      name,
      referenceCode,
      router,
      subscriptionNumber
    ]
  );

  return (
    <form onSubmit={createExpense}>
      <Heading>{l.invoice.new}</Heading>
      <Box p="2.5" />
      <Fieldset.Root maxW="md" size="lg">
        <Fieldset.Content mt="0.25rem">
          <Field
            label={l.economy.name}
            helperText={l.invoice.nameHint}
            required
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={l.invoice.comments} helperText={l.invoice.commentsHint}>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </Field>

          <Box p="2" />
        </Fieldset.Content>
      </Fieldset.Root>

      <Fieldset.Root maxW="md" size="lg">
        <Fieldset.Legend>{l.invoice.details}</Fieldset.Legend>
        <Fieldset.Content mt="0.25rem">
          <Separator />
          <Field
            label={l.invoice.customerName}
            helperText={l.invoice.customerNameHint}
            required
          >
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </Field>

          <Field label={l.invoice.dateOfDelivery}>
            <Input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </Field>

          <Field label={l.invoice.invoiceDate} required>
            <Input disabled value="Determined when it is sent" />
          </Field>

          <Field label={l.invoice.ourReference} required>
            <Input disabled value={user?.firstName + ' ' + user?.lastName} />
          </Field>

          <Field label={l.invoice.customersReference}>
            <Input
              value={customerReference}
              onChange={(e) => setCustomerReference(e.target.value)}
            />
          </Field>

          <Field label={l.invoice.referenceCode}>
            <Input
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
            />
          </Field>

          <Field label={l.invoice.subscriptionNumber}>
            <Input
              value={subscriptionNumber}
              onChange={(e) => setSubscriptionNumber(e.target.value)}
            />
          </Field>

          <Field label={l.invoice.customerOrderReference}>
            <Input
              value={customerOrderReference}
              onChange={(e) => setCustomerOrderReference(e.target.value)}
            />
          </Field>

          <Field label={l.invoice.contractNumber}>
            <Input
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
            />
          </Field>

          <Box p="2" />
        </Fieldset.Content>
      </Fieldset.Root>

      <Fieldset.Root maxW="md" size="lg">
        <Fieldset.Legend>
          {l.invoice.products}{' '}
          <IconButton
            variant="subtle"
            size="sm"
            onClick={() =>
              setItems([
                ...items,
                { name: '', amount: '', count: '', vat: InvoiceItemVat.VAT_0 }
              ])
            }
          >
            <HiPlus />
          </IconButton>
        </Fieldset.Legend>
        <Fieldset.Content mt="0.25rem">
          <Separator />

          {items.map((item, index) => (
            <Card.Root key={index}>
              <Card.Body>
                <Field label="Product">
                  <Input
                    value={item.name}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].name = e.target.value;
                      setItems(newItems);
                    }}
                  />
                </Field>

                <Field label="Price (each)" invalid={isNaN(+item.amount)}>
                  <Input
                    value={item.amount}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].amount = e.target.value;
                      setItems(newItems);
                    }}
                  />
                </Field>

                <Field label="Amount" invalid={isNaN(+item.count)}>
                  <Input
                    value={item.count}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].count = e.target.value;
                      setItems(newItems);
                    }}
                  />
                </Field>

                <Field label="VAT">
                  <SelectRoot
                    collection={vatTypes}
                    value={[item.vat]}
                    onValueChange={({ value }) => {
                      const newItems = [...items];
                      newItems[index].vat = value?.[0] as InvoiceItemVat;
                      setItems(newItems);
                    }}
                  >
                    <SelectLabel />
                    <SelectTrigger>
                      <SelectValueText placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vatTypes.items.map((item) => (
                        <SelectItem key={item.value} item={item}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Field>
                <IconButton
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    const newItems = [...items];
                    newItems.splice(index, 1);
                    setItems(newItems);
                  }}
                >
                  <HiTrash />
                </IconButton>
              </Card.Body>
            </Card.Root>
          ))}

          <Text>
            Total:{' '}
            {InvoiceService.calculateSumForItems(
              items.map((i) => formToInvoiceItem(i))
            ).toFixed(2)}{' '}
            kr
          </Text>

          <Field>
            <Button
              variant="surface"
              type="submit"
              disabled={items.length === 0}
            >
              Submit
            </Button>
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </form>
  );
}
