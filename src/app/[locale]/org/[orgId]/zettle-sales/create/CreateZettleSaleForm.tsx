'use client';

import { useCallback, useState } from 'react';
import {
  Box,
  createListCollection,
  Fieldset,
  Flex,
  Heading,
  Input
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import i18nService from '@/services/i18nService';
import { useRouter } from 'next/navigation';
import { createZettleSale, editZettleSale } from '@/actions/zettleSales';
import ZettleSaleService from '@/services/zettleSaleService';
import { GammaGroup } from '@/types/gamma';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from '@/components/ui/select';
import dayjs from 'dayjs';
import { InputGroup } from '@/components/ui/input-group';

export default function CreateZettleSaleForm({
  groups,
  locale,
  orgId,
  s
}: {
  groups: GammaGroup[];
  locale: string;
  orgId: number;
  s?: Awaited<ReturnType<typeof ZettleSaleService.getById>>;
}) {
  const l = i18nService.getLocale(locale);

  const groupOptions = createListCollection({
    items: groups.map((group) => ({
      label: group.prettyName,
      value: group.id
    }))
  });

  const router = useRouter();

  const [groupId, setGroupId] = useState<string | undefined>(s?.gammaGroupId);
  const [name, setName] = useState<string>(s?.name ?? '');
  const [date, setDate] = useState<string>(
    s?.saleDate ? i18nService.formatDate(s.saleDate, false) : ''
  );
  const [amount, setAmount] = useState<string>(s?.amount?.toString() ?? '');

  const createSale = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (s) {
        await editZettleSale(
          s.id,
          groupId ?? s.gammaGroupId,
          name,
          +amount,
          new Date(date)
        );
        router.push(`/org/${orgId}/zettle-sales`);
      } else if (groupId !== undefined) {
        await createZettleSale(groupId, orgId, name, +amount, new Date(date));
        router.push(`/org/${orgId}/zettle-sales`);
      }
    },
    [amount, date, groupId, name, orgId, router, s]
  );

  return (
    <form onSubmit={createSale}>
      <Heading>{l.zettleSales.create}</Heading>
      <Box p="2.5" />

      <Fieldset.Root maxW="md" size="lg">
        <Fieldset.Content>
          <Field label={l.general.description} required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field label={l.economy.amount} required>
            <InputGroup width="100%" endElement="kr">
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </InputGroup>
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

          <Field label={l.group.group} required>
            <SelectRoot
              collection={groupOptions}
              value={groupId !== undefined ? [groupId] : []}
              onValueChange={({ value }) => setGroupId(value?.[0])}
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

          <Field>
            <Button colorPalette="cyan" type="submit">
              {l.general.save}
            </Button>
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </form>
  );
}
