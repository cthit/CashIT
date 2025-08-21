'use client';

import { registerRequisition } from '@/actions/goCardless';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from '@/components/ui/select';
import { Requisition } from '@/services/goCardlessService';
import { Box, createListCollection } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function AddRequisitionForm({
  requisitions
}: {
  requisitions: Requisition[];
}) {
  const router = useRouter();
  const [id, setId] = useState<string | undefined>();

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (id) {
        await registerRequisition(id);
        router.push('/bank-accounts');
      }
    },
    [id, router]
  );

  const reqs = createListCollection({
    items: requisitions.map((r) => {
      return {
        label: r.reference,
        value: r.id
      };
    })
  });

  return (
    <form onSubmit={submit}>
      <Field label="Requisition Reference" required>
        <SelectRoot
          collection={reqs}
          value={id ? [id] : []}
          onValueChange={({ value }) => setId(value?.[0])}
        >
          <SelectLabel />
          <SelectTrigger>
            <SelectValueText placeholder="Select a requisition" />
          </SelectTrigger>
          <SelectContent>
            {reqs.items.map((item) => (
              <SelectItem key={item.value} item={item}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Field>

      <Box p="2" />

      <Button variant="surface" type="submit">
        Submit
      </Button>
    </form>
  );
}
