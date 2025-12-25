'use client';

import { pdf } from '@react-pdf/renderer';
import { useCallback, useState, memo } from 'react';
import {
  Box,
  Fieldset,
  Input,
  Heading,
  createListCollection,
  IconButton,
  Text,
  Table
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { InvoiceItemVat, Prisma } from '@prisma/client';
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from '@/components/ui/select';
import { HiDownload, HiPlus, HiTrash } from 'react-icons/hi';
import InvoiceService from '@/services/invoiceService';
import i18nService from '@/services/i18nService';
import ReceiptPdf from '@/components/ReceiptPdf/ReceiptPdf';
import FileService from '@/services/fileService';
import { InputGroup } from '@/components/ui/input-group';

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

const ReceiptItemRow = memo(
  ({
    item,
    index,
    onUpdate,
    onDelete
  }: {
    item: FormInvoiceItem;
    index: number;
    onUpdate: (
      index: number,
      field: keyof FormInvoiceItem,
      value: string
    ) => void;
    onDelete: (index: number) => void;
  }) => {
    const handleNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(index, 'name', e.target.value);
      },
      [index, onUpdate]
    );

    const handleCountChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(index, 'count', e.target.value);
      },
      [index, onUpdate]
    );

    const handleAmountChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(index, 'amount', e.target.value);
      },
      [index, onUpdate]
    );

    const handleVatChange = useCallback(
      ({ value }: { value: string[] }) => {
        onUpdate(index, 'vat', value?.[0] || InvoiceItemVat.VAT_25);
      },
      [index, onUpdate]
    );

    const handleDelete = useCallback(() => {
      onDelete(index);
    }, [index, onDelete]);

    return (
      <Table.Row>
        <Table.Cell py="1">
          <Field required>
            <Input value={item.name} onChange={handleNameChange} />
          </Field>
        </Table.Cell>

        <Table.Cell py="1">
          <Field invalid={isNaN(+item.count)} required>
            <Input value={item.count} onChange={handleCountChange} />
          </Field>
        </Table.Cell>

        <Table.Cell py="1">
          <Field invalid={isNaN(+item.amount)} required>
            <InputGroup endElement="kr" width="100%">
              <Input value={item.amount} onChange={handleAmountChange} />
            </InputGroup>
          </Field>
        </Table.Cell>

        <Table.Cell py="1">
          <Field required>
            <SelectRoot
              collection={vatTypes}
              value={[item.vat]}
              onValueChange={handleVatChange}
            >
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
        </Table.Cell>

        <Table.Cell py="1">
          <IconButton variant="subtle" size="sm" onClick={handleDelete}>
            <HiTrash />
          </IconButton>
        </Table.Cell>
      </Table.Row>
    );
  }
);

ReceiptItemRow.displayName = 'ReceiptItemRow';

export default function ReceiptCreateForm({
  locale,
  orgName
}: {
  locale: string;
  orgName: string;
}) {
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
          orgName={orgName}
        />
      ).toBlob();
      FileService.saveToFile(`receipt-${new Date().getTime()}.pdf`, blob);
    },
    [date, items, locale, name, purchaser, treasurer, orgName]
  );

  const handleUpdateItem = useCallback(
    (index: number, field: keyof FormInvoiceItem, value: string) => {
      setItems((prevItems) => {
        const newItems = [...prevItems];
        newItems[index] = { ...newItems[index], [field]: value };
        return newItems;
      });
    },
    []
  );

  const handleDeleteItem = useCallback((index: number) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  }, []);

  const handleAddItem = useCallback(() => {
    setItems((prevItems) => [
      ...prevItems,
      {
        name: '',
        amount: '',
        count: '',
        vat: InvoiceItemVat.VAT_25
      }
    ]);
  }, []);

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

      <Fieldset.Root size="lg">
        <Fieldset.Content mt="0.25rem">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>{l.economy.product}</Table.ColumnHeader>
                <Table.ColumnHeader>{l.economy.count}</Table.ColumnHeader>
                <Table.ColumnHeader>{l.economy.unitPrice}</Table.ColumnHeader>
                <Table.ColumnHeader>{l.economy.vat}</Table.ColumnHeader>
                <Table.ColumnHeader />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map((item, index) => (
                <ReceiptItemRow
                  key={index}
                  item={item}
                  index={index}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </Table.Body>
            <Table.Caption>
              <Button
                variant="subtle"
                float="right"
                mt="1"
                onClick={handleAddItem}
              >
                <HiPlus /> {l.economy.addProduct}
              </Button>
            </Table.Caption>
          </Table.Root>

          <Text textAlign="right">
            Total:{' '}
            {InvoiceService.calculateSumForItems(
              items.map((i) => formToInvoiceItem(i))
            ).toFixed(2)}{' '}
            kr
          </Text>

          <Field alignItems="end">
            <Button
              type="submit"
              disabled={items.length === 0}
              colorPalette="cyan"
            >
              <HiDownload /> {l.general.export}
            </Button>
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </form>
  );
}
