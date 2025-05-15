'use client';

import { pdf } from '@react-pdf/renderer';
import { useCallback, useState } from 'react';
import {
  Box,
  Fieldset,
  Input,
  Separator,
  Heading,
  Card,
  createListCollection,
  IconButton,
  Text
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
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
import ReceiptPdf from '@/components/ReceiptPdf/ReceiptPdf';
import FileService from '@/services/fileService';

export type FormInvoiceItem = {
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

export const formToInvoiceItem = (item: FormInvoiceItem) =>
  ({
    name: item.name,
    amount: +item.amount,
    count: +item.count,
    vat: item.vat
  } satisfies Prisma.InvoiceItemCreateInput);

export default function ReceiptCreateForm({ locale }: { locale: string }) {
  const l = i18nService.getLocale(locale);

  const [items, setItems] = useState<FormInvoiceItem[]>([]);
  const [name, setName] = useState('');
  const [purchaser, setPurchaser] = useState('');
  const [treasurer, setTreasurer] = useState('');
  const [date, setDate] = useState('');

  const exportPdf = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const blob = await pdf(
        <ReceiptPdf
          items={items}
          name={name}
          purchaser={purchaser}
          treasurer={treasurer}
          locale={locale}
          date={new Date(date)}
        />
      ).toBlob();
      FileService.saveToFile(`receipt-${new Date().getTime()}.pdf`, blob);
    },
    [date, items, locale, name, purchaser, treasurer]
  );

  return (
    <form onSubmit={exportPdf}>
      <Heading>{l.receipt.title}</Heading>
      <Box p="2.5" />
      <Fieldset.Root maxW="md" size="lg">
        <Fieldset.Content mt="0.25rem">
          <Field
            label={l.general.description}
            helperText={l.receipt.nameHint}
            required
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={l.economy.date} required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field
            label={l.receipt.purchaser}
            helperText={l.receipt.purchaserHint}
            required
          >
            <Input
              value={purchaser}
              onChange={(e) => setPurchaser(e.target.value)}
            />
          </Field>
          <Field
            label={l.receipt.treasurer}
            helperText={l.receipt.treasurerHint}
            required
          >
            <Input
              value={treasurer}
              onChange={(e) => setTreasurer(e.target.value)}
            />
          </Field>

          <Box p="2" />
        </Fieldset.Content>
      </Fieldset.Root>

      <Fieldset.Root maxW="md" size="lg">
        <Fieldset.Legend>
          {l.receipt.products}{' '}
          <IconButton
            variant="subtle"
            size="sm"
            onClick={() =>
              setItems([
                ...items,
                { name: '', amount: '', count: '', vat: InvoiceItemVat.VAT_25 }
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
                <Field label="Product" required>
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

                <Field label="Amount" invalid={isNaN(+item.count)} required>
                  <Input
                    value={item.count}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].count = e.target.value;
                      setItems(newItems);
                    }}
                  />
                </Field>

                <Field label="VAT" required>
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
              Export
            </Button>
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </form>
  );
}
