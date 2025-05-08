'use client';

import {
  createExpenseForGroup,
  createPersonalExpense,
  editExpenseForGroup,
  editPersonalExpense
} from '@/actions/expenses';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import {
  Fieldset,
  Input,
  Textarea,
  Text,
  Heading,
  Box,
  createListCollection,
  IconButton,
  Icon
} from '@chakra-ui/react';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import {
  FileUploadList,
  FileUploadRoot,
  FileUploadTrigger
} from '@/components/ui/file-upload';
import { HiUpload } from 'react-icons/hi';
import { ExpenseType, Prisma } from '@prisma/client';
import { LuCloud, LuUndo, LuX } from 'react-icons/lu';
import Link from 'next/link';
import i18nService from '@/services/i18nService';
import { InputGroup } from '@/components/ui/input-group';
import { GammaGroup } from '@/types/gamma';

export default function CreateExpenseForm({
  readOnly,
  groups,
  locale,
  gid,
  e
}: {
  readOnly?: boolean;
  groups: GammaGroup[];
  locale: string;
  gid?: string;
  e?: Prisma.ExpenseGetPayload<{ include: { receipts: true } }>;
}) {
  const l = i18nService.getLocale(locale);
  const router = useRouter();
  const editing = e !== undefined;

  const expenseTypes = createListCollection({
    items: [
      { label: l.expense.expenseType, value: ExpenseType.EXPENSE },
      { label: l.expense.invoiceType, value: ExpenseType.INVOICE }
    ]
  });

  const groupOptions = createListCollection({
    items: [{ label: 'No group', value: '' }].concat(
      groups.map((group) => ({
        label: group.prettyName,
        value: group.id
      }))
    )
  });

  const [removeFiles, setRemoveFiles] = useState<number[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [amount, setAmount] = useState<string>((e?.amount ?? '') + '');
  const [groupId, setGroupId] = useState<string | undefined>(gid);
  const [name, setName] = useState<string>(e?.name ?? '');
  const [date, setDate] = useState<string>(
    e?.occurredAt ? i18nService.formatDate(e.occurredAt, false) : ''
  );
  const [description, setDescription] = useState<string>(e?.description ?? '');
  const [type, setType] = useState<ExpenseType>(e?.type ?? ExpenseType.EXPENSE);

  const remainingCloudFiles =
    e?.receipts?.filter((file) => !removeFiles.includes(file.id)) ?? [];

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!type) return;
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('file', file);
      });
      groupId
        ? (editing
            ? editExpenseForGroup(
                e.id,
                groupId,
                +amount,
                name,
                description,
                new Date(date),
                formData,
                e.receipts
                  .filter((r) => !removeFiles.some((f) => f === r.id))
                  .map((r) => r.id),
                type
              )
            : createExpenseForGroup(
                groupId,
                +amount,
                name,
                description,
                new Date(date),
                formData,
                type
              )
          ).then(() => router.push(`/expenses`))
        : (editing
            ? editPersonalExpense(
                e.id,
                +amount,
                name,
                description,
                formData,
                e.receipts
                  .filter((r) => !removeFiles.some((f) => f === r.id))
                  .map((r) => r.id),
                type
              )
            : createPersonalExpense(
                +amount,
                name,
                description,
                new Date(date),
                formData,
                type
              )
          ).then(() => router.push('/expenses'));
    },
    [
      files,
      type,
      date,
      editing,
      e?.id,
      e?.receipts,
      amount,
      name,
      description,
      removeFiles,
      router,
      groupId
    ]
  );

  return (
    <form onSubmit={submit}>
      <Heading>{editing ? l.expense.editTitle : l.expense.newTitle}</Heading>
      <Box p="1" />
      <Fieldset.Root width={400}>
        <Fieldset.Content>
          <Text color="fg.muted" textStyle="sm">
            {l.expense.newDescription}
          </Text>

          <Field label={'Group'} required>
            <SelectRoot
              collection={groupOptions}
              value={groupId !== undefined ? [groupId] : []}
              onValueChange={({ value }) => setGroupId(value?.[0])}
              disabled={readOnly}
            >
              <SelectLabel />
              <SelectTrigger>
                <SelectValueText placeholder="Select a group" />
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

          <Field label={l.general.description} disabled={readOnly} required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field label={l.economy.date} required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={readOnly}
            />
          </Field>

          <Field label={l.economy.amountTotal} required>
            <InputGroup endElement="kr" width="100%">
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={readOnly}
              />
            </InputGroup>
          </Field>

          <Field label={l.expense.type} required>
            <SelectRoot
              collection={expenseTypes}
              value={type ? [type] : []}
              onValueChange={({ value }) => setType(value?.[0] as ExpenseType)}
              disabled={readOnly}
            >
              <SelectLabel />
              <SelectTrigger>
                <SelectValueText placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {expenseTypes.items.map((item) => (
                  <SelectItem key={item.value} item={item}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Field>

          <Field label={l.general.comment}>
            <Textarea
              disabled={readOnly}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <Field label={l.expense.receipts}>
            <FileUploadRoot
              disabled={readOnly}
              maxFiles={10}
              onFileChange={({ acceptedFiles }) =>
                setFiles(deduplicateFiles(acceptedFiles))
              }
              required={remainingCloudFiles.length === 0}
            >
              <FileUploadTrigger asChild>
                <Button variant="outline" size="sm">
                  <HiUpload /> {l.expense.receiptsUpload}
                </Button>
              </FileUploadTrigger>
              <FileUploadList files={files} clearable />
              {e?.receipts?.map((file) => {
                const fileDeleted = removeFiles.some((f) => f === file.id);
                return (
                  <UploadedFile
                    key={file.id}
                    name={file.name}
                    sha256={file.sha256}
                    onClick={() =>
                      setRemoveFiles(
                        fileDeleted
                          ? removeFiles.filter((f) => f !== file.id)
                          : removeFiles.concat(file.id)
                      )
                    }
                    deleted={fileDeleted}
                  />
                );
              })}
            </FileUploadRoot>
          </Field>

          {!readOnly && (
            <Field>
              <Button variant="surface" type="submit">
                {l.economy.submit}
              </Button>
            </Field>
          )}
        </Fieldset.Content>
      </Fieldset.Root>
    </form>
  );
}

const UploadedFile = ({
  name,
  sha256,
  deleted,
  onClick
}: {
  name: string;
  sha256: string;
  deleted?: boolean;
  onClick?: () => void;
}) => {
  return (
    <Box
      display="flex"
      borderWidth="1px"
      rounded="md"
      p="4"
      w="100%"
      alignItems="center"
      gap="3"
    >
      <Icon fontSize="lg" color="fg.muted">
        <LuCloud />
      </Icon>

      <Text textStyle="sm" color={deleted ? 'fg.muted' : undefined} flex="1">
        <Link href={'/api/media/' + sha256} target="_blank">
          {name}
        </Link>
      </Text>

      <Box asChild>
        <IconButton
          variant="ghost"
          color="fg.muted"
          size="xs"
          onClick={onClick}
        >
          {deleted ? <LuUndo /> : <LuX />}
        </IconButton>
      </Box>
    </Box>
  );
};

const deduplicateFiles = (files: File[]) => {
  return files.filter(
    (file, index, self) => index === self.findIndex((f) => f.name === file.name)
  );
};
