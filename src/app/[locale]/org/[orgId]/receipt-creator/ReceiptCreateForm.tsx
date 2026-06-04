'use client';

import { pdf } from '@react-pdf/renderer';
import { useCallback, useRef, useState, memo } from 'react';
import {
  Box,
  Fieldset,
  Flex,
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
import i18nService from '@/services/i18nService';
import dayjs from 'dayjs';
import ReceiptPdf from '@/components/ReceiptPdf/ReceiptPdf';
import FileService from '@/services/fileService';
import { InputGroup } from '@/components/ui/input-group';
import { Switch } from '@/components/ui/switch';

export type FormInvoiceItem = {
  id?: string;
  name: string;
  amount: string;
  count: string;
  vat: InvoiceItemVat;
  vatAmount?: string;
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
  }) satisfies Prisma.InvoiceItemCreateInput;

const ReceiptItemRow = memo(
  ({
    item,
    index,
    onUpdate,
    onDelete,
    onRef,
    onKeyDown,
    onNamePaste,
    manualVatMode
  }: {
    item: FormInvoiceItem;
    index: number;
    onUpdate: (
      index: number,
      field: keyof FormInvoiceItem,
      value: string
    ) => void;
    onDelete: (index: number) => void;
    onRef: (rowIndex: number, col: number, el: HTMLInputElement | null) => void;
    onKeyDown: (
      e: React.KeyboardEvent<HTMLInputElement>,
      rowIndex: number,
      col: number
    ) => void;
    onNamePaste: (
      e: React.ClipboardEvent<HTMLInputElement>,
      rowIndex: number
    ) => void;
    manualVatMode: boolean;
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

    const handleKeyDown0 = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(e, index, 0),
      [onKeyDown, index]
    );
    const handleKeyDown1 = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(e, index, 1),
      [onKeyDown, index]
    );
    const handleKeyDown2 = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(e, index, 2),
      [onKeyDown, index]
    );
    const handleKeyDown3 = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(e, index, 3),
      [onKeyDown, index]
    );
    const handleNamePasteLocal = useCallback(
      (e: React.ClipboardEvent<HTMLInputElement>) => onNamePaste(e, index),
      [onNamePaste, index]
    );

    return (
      <Table.Row>
        <Table.Cell py="1">
          <Field required>
            <Input
              value={item.name}
              onChange={handleNameChange}
              ref={(el) => onRef(index, 0, el)}
              onKeyDown={handleKeyDown0}
              onPaste={handleNamePasteLocal}
            />
          </Field>
        </Table.Cell>

        <Table.Cell py="1">
          <Field invalid={isNaN(+item.count)} required>
            <Input
              value={item.count}
              onChange={handleCountChange}
              ref={(el) => onRef(index, 1, el)}
              onKeyDown={handleKeyDown1}
            />
          </Field>
        </Table.Cell>

        <Table.Cell py="1">
          <Field invalid={isNaN(+item.amount)} required>
            <InputGroup endElement="kr" width="100%">
              <Input
                value={item.amount}
                onChange={handleAmountChange}
                ref={(el) => onRef(index, 2, el)}
                onKeyDown={handleKeyDown2}
              />
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

        {manualVatMode && (
          <Table.Cell py="1">
            <Field>
              <InputGroup endElement="kr" width="100%">
                <Input
                  value={item.vatAmount ?? ''}
                  onChange={(e) => onUpdate(index, 'vatAmount', e.target.value)}
                  ref={(el) => onRef(index, 3, el)}
                  onKeyDown={handleKeyDown3}
                  placeholder="0.00"
                />
              </InputGroup>
            </Field>
          </Table.Cell>
        )}
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
  const [seller, setSeller] = useState('');
  const [date, setDate] = useState('');
  const [manualVatMode, setManualVatMode] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const focusCell = useCallback((row: number, col: number, select = false) => {
    setTimeout(() => {
      const el = inputRefs.current[row]?.[col];
      if (!el) return;
      el.focus();
      if (select) el.select();
    }, 0);
  }, []);

  const handleCellKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement>,
      rowIndex: number,
      colIndex: number
    ) => {
      const input = e.currentTarget;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (rowIndex + 1 < items.length)
          focusCell(rowIndex + 1, colIndex, true);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (rowIndex > 0) focusCell(rowIndex - 1, colIndex, true);
      } else if (e.key === 'ArrowRight') {
        if (
          input.selectionStart === input.value.length &&
          colIndex < (manualVatMode ? 3 : 2)
        ) {
          e.preventDefault();
          focusCell(rowIndex, colIndex + 1, true);
        }
      } else if (e.key === 'ArrowLeft') {
        if (input.selectionStart === 0 && colIndex > 0) {
          e.preventDefault();
          focusCell(rowIndex, colIndex - 1, true);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (colIndex < (manualVatMode ? 3 : 2)) {
          focusCell(rowIndex, colIndex + 1, true);
        } else if (rowIndex + 1 < items.length) {
          focusCell(rowIndex + 1, 0, true);
        } else {
          setItems((prev) => [
            ...prev,
            { name: '', amount: '', count: '', vat: InvoiceItemVat.VAT_25 }
          ]);
          focusCell(rowIndex + 1, 0);
        }
      } else if (
        e.key === 'Backspace' &&
        colIndex === 0 &&
        items[rowIndex]?.name === '' &&
        rowIndex > 0
      ) {
        e.preventDefault();
        setItems((prev) => prev.filter((_, i) => i !== rowIndex));
        focusCell(rowIndex - 1, 0);
      }
    },
    [items, focusCell, manualVatMode]
  );

  const handleItemNamePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, rowIndex: number) => {
      const pastedText = e.clipboardData.getData('text');
      if (!pastedText.includes('\n')) return;
      e.preventDefault();
      const lines = pastedText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (lines.length === 0) return;
      const newItems = [...items];
      let lineIndex = 0;
      let cur = rowIndex;
      if (newItems[cur].name !== '') {
        newItems.splice(cur + 1, 0, {
          name: '',
          amount: '',
          count: '',
          vat: InvoiceItemVat.VAT_25
        });
        cur++;
      }
      newItems[cur] = { ...newItems[cur], name: lines[lineIndex++] };
      cur++;
      while (lineIndex < lines.length && cur < newItems.length) {
        if (newItems[cur].name === '') {
          newItems[cur] = { ...newItems[cur], name: lines[lineIndex++] };
          cur++;
        } else {
          break;
        }
      }
      while (lineIndex < lines.length) {
        newItems.splice(cur, 0, {
          name: lines[lineIndex++],
          amount: '',
          count: '',
          vat: InvoiceItemVat.VAT_25
        });
        cur++;
      }
      setItems(newItems);
      focusCell(newItems.length - 1, 0);
    },
    [items, focusCell]
  );

  const handleItemRef = useCallback(
    (rowIndex: number, col: number, el: HTMLInputElement | null) => {
      if (!inputRefs.current[rowIndex]) inputRefs.current[rowIndex] = [];
      inputRefs.current[rowIndex][col] = el;
    },
    []
  );

  const exportPdf = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const blob = await pdf(
        <ReceiptPdf
          items={items}
          name={name}
          purchaser={purchaser}
          treasurer={treasurer}
          seller={seller}
          locale={locale}
          date={new Date(date)}
          orgName={orgName}
          manualVatMode={manualVatMode}
        />
      ).toBlob();
      FileService.saveToFile(`receipt-${new Date().getTime()}.pdf`, blob);
    },
    [
      date,
      items,
      locale,
      manualVatMode,
      name,
      purchaser,
      seller,
      treasurer,
      orgName
    ]
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

  const vatMult: Record<InvoiceItemVat, number> = {
    [InvoiceItemVat.VAT_0]: 1.0,
    [InvoiceItemVat.VAT_6]: 1.06,
    [InvoiceItemVat.VAT_12]: 1.12,
    [InvoiceItemVat.VAT_25]: 1.25
  };
  const total = items.reduce((acc, item) => {
    const base = (+item.count || 0) * (+item.amount || 0);
    if (manualVatMode && item.vatAmount) {
      return acc + base + (+item.vatAmount || 0);
    }
    return acc + base * (vatMult[item.vat] ?? 1.25);
  }, 0);

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
            <Flex gap="2" align="center" width="100%">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                flex="1"
              />
              <Button
                variant="subtle"
                size="sm"
                type="button"
                onClick={() => setDate(dayjs().format('YYYY-MM-DD'))}
                flexShrink={0}
              >
                {l.nameLists.today}
              </Button>
            </Flex>
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
          <Field label={l.receipt.seller} helperText={l.receipt.sellerHint}>
            <Input value={seller} onChange={(e) => setSeller(e.target.value)} />
          </Field>

          <Box p="2" />
        </Fieldset.Content>
      </Fieldset.Root>

      <Fieldset.Root size="lg" minW="0">
        <Fieldset.Content mt="0.25rem">
          <Switch
            checked={manualVatMode}
            onCheckedChange={(e) => setManualVatMode(e.checked)}
          >
            {l.receipt.manualVatAmount}
          </Switch>
          {manualVatMode && (
            <Flex align="center" gap="2">
              <Text color="orange.500" textStyle="sm">
                ⚠️ {l.receipt.manualVatWarning}
              </Text>
            </Flex>
          )}
          <Flex flexDir="column" w="100%">
            <Box
              p="1px"
              overflowX="auto"
              overflowY="visible"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <Table.Root minW={manualVatMode ? 750 : 600}>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>{l.economy.product}</Table.ColumnHeader>
                    <Table.ColumnHeader>{l.economy.count}</Table.ColumnHeader>
                    <Table.ColumnHeader>
                      {l.economy.unitPrice}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader w={100}>
                      {l.economy.vat}
                    </Table.ColumnHeader>
                    {manualVatMode && (
                      <Table.ColumnHeader>
                        {l.receipt.vatAmount}
                      </Table.ColumnHeader>
                    )}
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
                      onRef={handleItemRef}
                      onKeyDown={handleCellKeyDown}
                      onNamePaste={handleItemNamePaste}
                      manualVatMode={manualVatMode}
                    />
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Flex>

          <Field alignItems="end">
            <Button
              variant="subtle"
              float="right"
              mt="1"
              onClick={handleAddItem}
            >
              <HiPlus /> {l.economy.addProduct}
            </Button>
          </Field>

          <Text textAlign="right">Total: {total.toFixed(2)} kr</Text>

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
