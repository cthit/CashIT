'use client';

import { useCallback, useState } from 'react';
import {
  Box,
  createListCollection,
  Fieldset,
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

export default function CreateZettleSaleForm({
  groups,
  locale,
  s
}: {
  groups: GammaGroup[];
  locale: string;
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
    i18nService.formatDate(s?.saleDate ?? new Date(), false)
  );
  const [amount, setAmount] = useState<string>(s?.amount?.toString() ?? '');

  const createSale = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (s) {
        await editZettleSale(s.id, name, +amount, new Date(date));
        router.push('/zettle-sales');
      } else if (groupId !== undefined) {
        await createZettleSale(groupId, name, +amount, new Date(date));
        router.push('/zettle-sales');
      }
    },
    [amount, date, groupId, name, router, s]
  );

  return (
    <form onSubmit={createSale}>
      <Heading>{l.zettleSales.create}</Heading>
      <Box p="2.5" />

      <Fieldset.Root maxW="md" size="lg">
        <Fieldset.Content>
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

          <Field label={l.general.description} required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field label={l.expense.date} required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>

          <Field label={l.economy.amount} required>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>

          <Field>
            <Button variant="surface" type="submit">
              {l.economy.submit}
            </Button>
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>
    </form>
  );
}
