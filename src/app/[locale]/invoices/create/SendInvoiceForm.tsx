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
import { GammaGroup, GammaUser } from '@/types/gamma';
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
  readOnly,
  groups,
  locale,
  user,
  i
}: {
  readOnly?: boolean;
  groups: GammaGroup[];
  locale: string;
  user?: GammaUser;
  i?: Prisma.InvoiceGetPayload<{ include: { items: true } }>;
}) {
  const l = i18nService.getLocale(locale);
  const editing = i !== undefined;

  const router = useRouter();

  const groupOptions = createListCollection({
    items: [{ label: l.group.noGroup, value: '' }].concat(
      groups.map((group) => ({
        label: group.prettyName,
        value: group.id
      }))
    )
  });

  const [groupId, setGroupId] = useState<string | undefined>(undefined);
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
      groupId
        ? (editing
            ? editInvoiceForGroup(
                i.id,
                groupId,
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
                groupId,
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
          ).then(() => router.push('/invoices'))
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
      groupId,
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
          <Field label={l.group.group} required>
            <SelectRoot
              collection={groupOptions}
              value={groupId !== undefined ? [groupId] : []}
              onValueChange={({ value }) => setGroupId(value?.[0])}
              disabled={readOnly}
            >
              <SelectLabel />
              <SelectTrigger>
                <SelectValueText placeholder={l.group.selectGroup} />
              </SelectTrigger>
              <SelectContent>
                {groupOptions.items.map((item) => (
                  <SelectItem key={item.value} item={item}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Field>

          <Field
            disabled={readOnly}
            label={l.general.description}
            helperText={l.invoice.nameHint}
            required
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={l.general.comment} helperText={l.invoice.commentsHint}>
            <Textarea
              disabled={readOnly}
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
            disabled={readOnly}
            label={l.invoice.customerName}
            helperText={l.invoice.customerNameHint}
            required
          >
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </Field>

          <Field disabled={readOnly} label={l.invoice.dateOfDelivery}>
            <Input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </Field>

          <Field disabled={readOnly} label={l.invoice.invoiceDate} required>
            <Input disabled value={l.invoice.determinedWhenSent} />
          </Field>

          <Field disabled={readOnly} label={l.invoice.ourReference} required>
            <Input disabled value={user?.firstName + ' ' + user?.lastName} />
          </Field>

          <Field disabled={readOnly} label={l.invoice.customersReference}>
            <Input
              value={customerReference}
              onChange={(e) => setCustomerReference(e.target.value)}
            />
          </Field>

          <Field disabled={readOnly} label={l.invoice.referenceCode}>
            <Input
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
            />
          </Field>

          <Field disabled={readOnly} label={l.invoice.subscriptionNumber}>
            <Input
              value={subscriptionNumber}
              onChange={(e) => setSubscriptionNumber(e.target.value)}
            />
          </Field>

          <Field disabled={readOnly} label={l.invoice.customerOrderReference}>
            <Input
              value={customerOrderReference}
              onChange={(e) => setCustomerOrderReference(e.target.value)}
            />
          </Field>

          <Field disabled={readOnly} label={l.invoice.contractNumber}>
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
            disabled={readOnly}
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
                <Field label="Product" disabled={readOnly} required>
                  <Input
                    value={item.name}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].name = e.target.value;
                      setItems(newItems);
                    }}
                  />
                </Field>

                <Field
                  disabled={readOnly}
                  label="Price (each)"
                  invalid={isNaN(+item.amount)}
                  required
                >
                  <Input
                    value={item.amount}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].amount = e.target.value;
                      setItems(newItems);
                    }}
                  />
                </Field>

                <Field
                  disabled={readOnly}
                  label="Amount"
                  invalid={isNaN(+item.count)}
                  required
                >
                  <Input
                    value={item.count}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].count = e.target.value;
                      setItems(newItems);
                    }}
                  />
                </Field>

                <Field disabled={readOnly} label="VAT" required>
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
                  disabled={readOnly}
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
              disabled={readOnly || items.length === 0}
            >
              {l.economy.submit}
            </Button>
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </form>
  );
}
