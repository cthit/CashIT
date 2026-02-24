'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Box,
  createListCollection,
  Fieldset,
  Flex,
  Heading,
  IconButton,
  Input,
  Separator,
  Text,
  Textarea
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { GammaGroup, GammaGroupMember, GammaSuperGroup } from '@/types/gamma';
import i18nService from '@/services/i18nService';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from '@/components/ui/select';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { NameListType } from '@prisma/client';
import { HiPlus, HiTrash } from 'react-icons/hi';
import {
  createNameListForGroup,
  createPersonalNameList,
  editNameList
} from '@/actions/nameLists';
import { useRouter } from 'next/navigation';
import NameListService from '@/services/nameListService';
import dayjs from 'dayjs';
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot
} from '@/components/ui/accordion';

export interface GroupNameItem {
  name: string;
  amount: string;
}

const sgToMembers = (
  sg: { members: GammaGroupMember[] },
  nl?: Awaited<ReturnType<typeof NameListService.getById>>
) => {
  return nl && sg
    ? sg.members.map((m) => ({
        id: m.user.id,
        nameNick: `${m.user.firstName} "${m.user.nick}" ${m.user.lastName}`,
        fullName: `${m.user.firstName} ${m.user.lastName}`,
        amount:
          nl.gammaNames
            .find((n) => n.gammaUserId === m.user.id)
            ?.cost.toString() ?? ''
      }))
    : (sg?.members.map((m) => ({
        id: m.user.id,
        nameNick: `${m.user.firstName} "${m.user.nick}" ${m.user.lastName}`,
        fullName: `${m.user.firstName} ${m.user.lastName}`,
        amount: ''
      })) ?? []);
};

export default function CreateNameListForm({
  superGroups,
  nl,
  groups,
  orgId,
  locale
}: {
  superGroups: { members: GammaGroupMember[]; superGroup: GammaSuperGroup }[];
  nl?: Awaited<ReturnType<typeof NameListService.getById>>;
  groups: GammaGroup[];
  orgId: number;
  locale: string;
}) {
  const l = i18nService.getLocale(locale);

  const groupOptions = createListCollection({
    items: [{ label: l.group.noGroup, value: 'cashit-nogroup' }].concat(
      groups.map((group) => ({
        label: group.prettyName,
        value: group.id
      }))
    )
  });

  const router = useRouter();

  const superGroupsReverse = useMemo(
    () =>
      superGroups.reduce(
        (acc, group) => {
          acc[group.superGroup.id] = group;
          return acc;
        },
        {} as Record<string, { members: GammaGroupMember[] }>
      ),
    [superGroups]
  );

  const groupToSuperGroup = useMemo(
    () =>
      groups.reduce(
        (acc, group) => {
          acc[group.id] = group.superGroup.id;
          return acc;
        },
        {} as Record<string, string>
      ),
    [groups]
  );

  const [groupId, setGroupId] = useState<string | undefined>(
    (nl?.gammaGroupId === null ? '' : nl?.gammaGroupId) ?? undefined
  );
  const [name, setName] = useState<string>(nl?.name ?? '');
  const [date, setDate] = useState<string>(
    nl?.occurredAt ? i18nService.formatDate(nl.occurredAt, false) : ''
  );
  const [type, setType] = useState<NameListType>(
    nl?.type ?? NameListType.EVENT
  );
  const [trackIndividual, setTrackIndividual] = useState<boolean>(
    nl?.tracked ?? false
  );
  const [nameSource, setNameSource] = useState<'members' | 'custom'>(
    (nl?.names.length ?? 1 > 0) ? 'custom' : 'members'
  );
  const [names, setNames] = useState<GroupNameItem[]>(
    nl?.names.map((n) => ({
      name: n.name,
      amount: n.cost.toString()
    })) ?? []
  );
  const [groupNames, setGroupNames] = useState(
    groupId
      ? sgToMembers(superGroupsReverse[groupToSuperGroup[groupId] ?? ''], nl)
      : []
  );
  const [bulkInput, setBulkInput] = useState('');

  const nameInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const edited = nl !== undefined && nl !== null;

  const createList = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const useMembers = nameSource === 'members';

      const customNames = !useMembers
        ? names.map((n) => ({ name: n.name, cost: +n.amount }))
        : [];
      const gammaNames = useMembers
        ? groupNames
            .map((n) => ({ gammaUserId: n.id, cost: +n.amount }))
            .filter((n) => n.cost > 0)
        : [];

      edited
        ? editNameList(
            nl.id,
            groupId === 'cashit-nogroup' ? null : (groupId ?? nl.gammaGroupId),
            name,
            type,
            customNames,
            gammaNames,
            trackIndividual,
            new Date(date)
          ).then(() => router.push(`/org/${orgId}/name-lists`))
        : groupId !== undefined && groupId !== 'cashit-nogroup'
          ? createNameListForGroup(
              groupId,
              orgId,
              name,
              type,
              customNames,
              gammaNames,
              trackIndividual,
              new Date(date)
            ).then(() => router.push(`/org/${orgId}/name-lists`))
          : createPersonalNameList(
              orgId,
              name,
              type,
              customNames,
              gammaNames,
              trackIndividual,
              new Date(date)
            ).then(() => router.push(`/org/${orgId}/name-lists`));
    },
    [
      edited,
      date,
      nl,
      groupId,
      groupNames,
      name,
      nameSource,
      names,
      router,
      trackIndividual,
      type,
      orgId
    ]
  );

  const listTypes = createListCollection({
    items: [
      { label: l.nameLists.types.event, value: NameListType.EVENT },
      { label: l.nameLists.types.workFood, value: NameListType.WORK_FOOD },
      {
        label: l.nameLists.types.teambuilding,
        value: NameListType.TEAMBUILDING
      },
      {
        label: l.nameLists.types.profileClothing,
        value: NameListType.PROFILE_CLOTHING
      }
    ]
  });

  const handleBulkAdd = () => {
    const newNames = bulkInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => ({ name: s, amount: '' }));
    if (newNames.length > 0) {
      setNames([...names, ...newNames]);
    }
    setBulkInput('');
  };

  const handleNameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const nextIndex = index + 1;
    if (nextIndex < names.length) {
      nameInputRefs.current[nextIndex]?.focus();
      nameInputRefs.current[nextIndex]?.select();
    } else {
      setNames((prev) => [...prev, { name: '', amount: '' }]);
      setTimeout(() => {
        nameInputRefs.current[nextIndex]?.focus();
      }, 0);
    }
  };

  return (
    <form onSubmit={createList}>
      <Heading>{nl ? l.nameLists.edit : l.nameLists.create}</Heading>
      <Box p="2.5" />
      <Fieldset.Root maxW="md" width="100%">
        <Fieldset.Content>
          <Field label={l.general.description} required>
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

          <Field label={l.group.group} required>
            <SelectRoot
              collection={groupOptions}
              value={groupId !== undefined ? [groupId] : []}
              onValueChange={({ value }) => {
                const id = value?.[0];
                setGroupId(id);

                if (id === '') {
                  setGroupNames([]);
                  setNameSource('custom');
                  return;
                }

                const superGroupId = groups.find((g) => g.id === id)?.superGroup
                  .id;
                setGroupNames(
                  sgToMembers(
                    superGroupsReverse[superGroupId ?? ''] ?? { members: [] },
                    nl
                  )
                );
              }}
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

          <Field label={l.expense.type}>
            <SelectRoot
              collection={listTypes}
              value={type ? [type] : []}
              onValueChange={({ value }) => setType(value?.[0] as NameListType)}
            >
              <SelectLabel />
              <SelectTrigger>
                <SelectValueText placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {listTypes.items.map((item) => (
                  <SelectItem key={item.value} item={item}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Field>

          <Field label={l.nameLists.format}>
            <SegmentedControl
              value={nameSource}
              onValueChange={(e) =>
                setNameSource(e.value as 'members' | 'custom')
              }
              items={[
                {
                  label: l.nameLists.formatMembers,
                  value: 'members',
                  disabled: groupId === ''
                },
                { label: l.nameLists.formatCustom, value: 'custom' }
              ]}
            />
          </Field>

          <Switch
            checked={trackIndividual}
            onCheckedChange={(e) => setTrackIndividual(e.checked)}
          >
            {l.nameLists.trackIndividual}
          </Switch>

          <Box p="2" />
        </Fieldset.Content>
      </Fieldset.Root>

      <Fieldset.Root maxW="md" size="lg" hidden={nameSource !== 'members'}>
        <Fieldset.Legend>{l.nameLists.names}</Fieldset.Legend>
        <Fieldset.Content mt="0.25rem">
          <Separator />

          {groupNames.map((member, index) => (
            <Flex
              key={member.id}
              align="center"
              justify="space-between"
              gap="3"
            >
              <Text flex="1" minW="0" truncate>
                {member.nameNick}
              </Text>
              {trackIndividual ? (
                <Input
                  type="number"
                  value={member.amount}
                  width="7rem"
                  flexShrink={0}
                  onChange={(e) => {
                    const newItems = [...groupNames];
                    newItems[index].amount = e.target.value;
                    setGroupNames(newItems);
                  }}
                />
              ) : (
                <Switch
                  checked={+groupNames[index].amount > 0}
                  flexShrink={0}
                  onChange={() => {
                    const newItems = [...groupNames];
                    newItems[index].amount =
                      +groupNames[index].amount > 0 ? '0' : '1';
                    setGroupNames(newItems);
                  }}
                />
              )}
            </Flex>
          ))}

          {groupNames.length === 0 && (
            <Text>{l.nameLists.membersNotFound}</Text>
          )}

          <Flex justify="flex-end" mt="2">
            <Button variant="surface" type="submit">
              {l.economy.submit}
            </Button>
          </Flex>
        </Fieldset.Content>
      </Fieldset.Root>

      <Fieldset.Root maxW="md" size="lg" hidden={nameSource !== 'custom'}>
        <Fieldset.Legend>{l.nameLists.names}</Fieldset.Legend>
        <Fieldset.Content mt="0.25rem">
          <Separator />

          {names.map((nameItem, index) => (
            <Flex
              key={index}
              gap="2"
              align="center"
              flexWrap={{ base: 'wrap', md: 'nowrap' }}
            >
              <Input
                placeholder={l.economy.name}
                value={nameItem.name}
                flex="1"
                minW="8rem"
                ref={(el) => {
                  nameInputRefs.current[index] = el;
                }}
                onChange={(e) => {
                  const newItems = [...names];
                  newItems[index].name = e.target.value;
                  setNames(newItems);
                }}
                onKeyDown={(e) => handleNameKeyDown(e, index)}
              />
              {trackIndividual && (
                <Input
                  placeholder={l.economy.amount}
                  value={nameItem.amount}
                  width="7rem"
                  flexShrink={0}
                  onChange={(e) => {
                    const newItems = [...names];
                    newItems[index].amount = e.target.value;
                    setNames(newItems);
                  }}
                />
              )}
              <IconButton
                variant="subtle"
                size="sm"
                flexShrink={0}
                onClick={() => {
                  const newItems = [...names];
                  newItems.splice(index, 1);
                  setNames(newItems);
                }}
              >
                <HiTrash />
              </IconButton>
            </Flex>
          ))}

          <Button
            variant="subtle"
            size="sm"
            type="button"
            onClick={() => {
              const nextIndex = names.length;
              setNames((prev) => [...prev, { name: '', amount: '' }]);
              setTimeout(() => {
                nameInputRefs.current[nextIndex]?.focus();
              }, 0);
            }}
          >
            <HiPlus />
            {l.nameLists.addName}
          </Button>

          <AccordionRoot collapsible mt="2" variant="plain">
            <AccordionItem value="bulk-add">
              <AccordionItemTrigger px="3" py="2" textStyle="sm">
                {l.nameLists.bulkAdd}
              </AccordionItemTrigger>
              <AccordionItemContent px="3" pb="3">
                <Flex direction="column" gap="2">
                  <Textarea
                    placeholder={l.nameLists.bulkAddPlaceholder}
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    rows={4}
                  />
                  <Flex justify="flex-end">
                    <Button
                      variant="subtle"
                      size="sm"
                      type="button"
                      onClick={handleBulkAdd}
                    >
                      {l.nameLists.bulkAddButton}
                    </Button>
                  </Flex>
                </Flex>
              </AccordionItemContent>
            </AccordionItem>
          </AccordionRoot>

          <Flex justify="flex-end" mt="2">
            <Button type="submit" colorPalette="cyan">
              {l.economy.submit}
            </Button>
          </Flex>
        </Fieldset.Content>
      </Fieldset.Root>
    </form>
  );
}
