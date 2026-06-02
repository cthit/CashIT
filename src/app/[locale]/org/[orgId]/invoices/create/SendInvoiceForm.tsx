'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Box,
  Fieldset,
  Input,
  Separator,
  Textarea,
  Heading,
  createListCollection,
  IconButton,
  Text,
  Table,
  Flex
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { GammaGroup, GammaUser } from '@/types/gamma';
import {
  createInvoiceForGroup,
  createPersonalInvoice,
  editInvoice
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
import { InputGroup } from '@/components/ui/input-group';

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
  }) satisfies Prisma.InvoiceItemCreateInput;

const invoiceToForm = (item: Prisma.InvoiceItemGetPayload<{}>) =>
  ({
    name: item.name,
    amount: item.amount + '',
    count: item.count + '',
    vat: item.vat
  }) satisfies FormInvoiceItem;

export default function SendInvoiceForm({
  readOnly,
  groups,
  locale,
  orgId,
  user,
  i
}: {
  readOnly?: boolean;
  groups: GammaGroup[];
  locale: string;
  orgId: number;
  user?: GammaUser;
  i?: Prisma.InvoiceGetPayload<{ include: { items: true } }>;
}) {
  const l = i18nService.getLocale(locale);
  const editing = i !== undefined;

  const router = useRouter();

  const groupOptions = createListCollection({
    items: [{ label: l.group.noGroup, value: 'cashit-nogroup' }].concat(
      groups.map((group) => ({
        label: group.prettyName,
        value: group.id
      }))
    )
  });

  const [groupId, setGroupId] = useState<string | undefined>(
    i !== undefined && i !== null
      ? (i.gammaGroupId ?? 'cashit-nogroup')
      : undefined
  );
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
        if (input.selectionStart === input.value.length && colIndex < 2) {
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
        if (colIndex < 2) {
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
    [items, focusCell]
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

  const createExpense = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      groupId !== undefined && groupId !== 'cashit-nogroup'
        ? (editing
            ? editInvoice(
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
                orgId,
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
          ).then(() => router.push(`/org/${orgId}/invoices`))
        : (editing
            ? editInvoice(
                i.id,
                null,
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
                orgId,
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
          ).then(() => router.push(`/org/${orgId}/invoices`));
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
      subscriptionNumber,
      orgId
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

      <Fieldset.Root size="lg" minW="0">
        <Fieldset.Content mt="0.25rem">
          <Flex flexDir="column" w="100%">
            <Box
              p="1px"
              overflowX="auto"
              overflowY="visible"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <Table.Root minW={600}>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Artikel</Table.ColumnHeader>
                    <Table.ColumnHeader>Antal</Table.ColumnHeader>
                    <Table.ColumnHeader>Á pris</Table.ColumnHeader>
                    <Table.ColumnHeader w={100}>Moms</Table.ColumnHeader>
                    <Table.ColumnHeader />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {items.map((item, index) => (
                    <Table.Row key={index}>
                      <Table.Cell py="1">
                        <Field required>
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].name = e.target.value;
                              setItems(newItems);
                            }}
                            ref={(el) => {
                              if (!inputRefs.current[index])
                                inputRefs.current[index] = [];
                              inputRefs.current[index][0] = el;
                            }}
                            onKeyDown={(e) => handleCellKeyDown(e, index, 0)}
                            onPaste={(e) => handleItemNamePaste(e, index)}
                          />
                        </Field>
                      </Table.Cell>

                      <Table.Cell py="1">
                        <Field invalid={isNaN(+item.count)} required>
                          <Input
                            value={item.count}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].count = e.target.value;
                              setItems(newItems);
                            }}
                            ref={(el) => {
                              if (!inputRefs.current[index])
                                inputRefs.current[index] = [];
                              inputRefs.current[index][1] = el;
                            }}
                            onKeyDown={(e) => handleCellKeyDown(e, index, 1)}
                          />
                        </Field>
                      </Table.Cell>

                      <Table.Cell py="1">
                        <Field invalid={isNaN(+item.amount)} required>
                          <InputGroup endElement="kr" width="100%">
                            <Input
                              value={item.amount}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[index].amount = e.target.value;
                                setItems(newItems);
                              }}
                              ref={(el) => {
                                if (!inputRefs.current[index])
                                  inputRefs.current[index] = [];
                                inputRefs.current[index][2] = el;
                              }}
                              onKeyDown={(e) => handleCellKeyDown(e, index, 2)}
                            />
                          </InputGroup>
                        </Field>
                      </Table.Cell>

                      <Table.Cell py="1">
                        <Field required>
                          <SelectRoot
                            collection={vatTypes}
                            value={[item.vat]}
                            onValueChange={({ value }) => {
                              const newItems = [...items];
                              newItems[index].vat =
                                value?.[0] as InvoiceItemVat;
                              setItems(newItems);
                            }}
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
                      </Table.Cell>
                    </Table.Row>
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
              onClick={() =>
                setItems([
                  ...items,
                  {
                    name: '',
                    amount: '',
                    count: '',
                    vat: InvoiceItemVat.VAT_25
                  }
                ])
              }
            >
              <HiPlus /> Lägg till artikel
            </Button>
          </Field>

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
              {i ? l.general.save : l.economy.submit}
            </Button>
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </form>
  );
}
