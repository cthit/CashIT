'use client';

import { createListCollection, Select } from '@chakra-ui/react';
import i18nService from '@/services/i18nService';
import {
  SelectRoot,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectValueText
} from '../ui/select';
import { useRouter } from 'next/navigation';

const OrganizationSelector = ({
  locale,
  orgs,
  orgId,
  inDrawer = false
}: {
  locale: string;
  orgs: { id: number; name: string }[];
  orgId?: number;
  inDrawer?: boolean;
}) => {
  const router = useRouter();

  const l = i18nService.getLocale(locale);

  const frameworks = createListCollection({
    items: orgs.map((org) => ({ label: org.name, value: org.id.toString() }))
  });

  return (
    <SelectRoot
      collection={frameworks}
      positioning={
        inDrawer
          ? {
              placement: 'top',
              gutter: 8,
              flip: true,
              slide: true
            }
          : undefined
      }
      defaultValue={orgId ? [orgId.toString()] : undefined}
      onValueChange={({ value }) => {
        if (value?.[0] !== undefined) router.push(`/org/${value[0]}`);
      }}
    >
      <SelectLabel />
    <Select.Trigger
      borderBottom="none"
      borderLeft="none"
      borderRight="none"
      borderRadius={0}
      cursor="pointer"
      overflow="hidden"
    >
      <SelectValueText
        placeholder="Select an organization"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        maxWidth="100%"
        display="block"
      />
      <Select.Indicator />
    </Select.Trigger>

      <SelectContent portalled={!inDrawer}>
        {frameworks.items.map((item) => (
          <SelectItem key={item.value} item={item} border="none">
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

export default OrganizationSelector;
