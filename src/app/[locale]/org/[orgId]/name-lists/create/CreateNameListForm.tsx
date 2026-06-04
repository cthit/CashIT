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
  InputGroup,
  Separator,
  Text
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

export interface GroupNameItem {
  name: string;
  amount: string;
}

const sgToMembers = (
  sg: { members: GammaGroupMember[] },
  nl?: Awaited<ReturnType<typeof NameListService.getById>>
) =>
  sg?.members.map((m) => ({
    id: m.user.id,
    nameNick: `${m.user.firstName} "${m.user.nick}" ${m.user.lastName}`,
    fullName: `${m.user.firstName} ${m.user.lastName}`,
    amount:
      nl?.gammaNames
        .find((n) => n.gammaUserId === m.user.id)
        ?.cost.toString() ?? ''
  })) ?? [];

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
  const router = useRouter();
  const edited = nl !== undefined && nl !== null;

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

  const groupOptions = useMemo(
    () =>
      createListCollection({
        items: [{ label: l.group.noGroup, value: 'cashit-nogroup' }].concat(
          groups.map((group) => ({ label: group.prettyName, value: group.id }))
        )
      }),
    [groups, l.group.noGroup]
  );

  const listTypes = useMemo(
    () =>
      createListCollection({
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
      }),
    [l.nameLists.types]
  );

  const [groupId, setGroupId] = useState<string | undefined>(
    (nl?.gammaGroupId === null ? '' : nl?.gammaGroupId) ?? undefined
  );
  const [name, setName] = useState(nl?.name ?? '');
  const [date, setDate] = useState(
    nl?.occurredAt ? i18nService.formatDate(nl.occurredAt, false) : ''
  );
  const [type, setType] = useState<NameListType>(
    nl?.type ?? NameListType.EVENT
  );
  const [trackIndividual, setTrackIndividual] = useState(nl?.tracked ?? false);
  const [nameSource, setNameSource] = useState<'members' | 'custom'>(
    (nl?.names.length ?? 1 > 0) ? 'custom' : 'members'
  );
  const [names, setNames] = useState<GroupNameItem[]>(
    nl?.names.map((n) => ({ name: n.name, amount: n.cost.toString() })) ?? []
  );
  const [groupNames, setGroupNames] = useState(
    groupId
      ? sgToMembers(superGroupsReverse[groupToSuperGroup[groupId] ?? ''], nl)
      : []
  );

  const nameInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusField = useCallback((index: number, select = false) => {
    setTimeout(() => {
      nameInputRefs.current[index]?.focus();
      if (select) nameInputRefs.current[index]?.select();
    }, 0);
  }, []);

  const createList = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const useMembers = nameSource === 'members';
      const customNames = useMembers
        ? []
        : names.map((n) => ({ name: n.name, cost: +n.amount }));
      const gammaNames = useMembers
        ? groupNames
            .map((n) => ({ gammaUserId: n.id, cost: +n.amount }))
            .filter((n) => n.cost > 0)
        : [];
      const resolvedGroupId = groupId === 'cashit-nogroup' ? null : groupId;

      if (edited) {
        await editNameList(
          nl.id,
          resolvedGroupId ?? nl.gammaGroupId,
          name,
          type,
          customNames,
          gammaNames,
          trackIndividual,
          new Date(date)
        );
      } else if (resolvedGroupId) {
        await createNameListForGroup(
          resolvedGroupId,
          orgId,
          name,
          type,
          customNames,
          gammaNames,
          trackIndividual,
          new Date(date)
        );
      } else {
        await createPersonalNameList(
          orgId,
          name,
          type,
          customNames,
          gammaNames,
          trackIndividual,
          new Date(date)
        );
      }
      router.push(`/org/${orgId}/name-lists`);
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

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        const next = index + 1;
        if (next < names.length) {
          focusField(next, true);
        } else if (e.key === 'Enter') {
          setNames((prev) => [...prev, { name: '', amount: '' }]);
          focusField(next);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (index > 0) focusField(index - 1, true);
      } else if (
        e.key === 'Backspace' &&
        names[index].name === '' &&
        index > 0
      ) {
        e.preventDefault();
        setNames((prev) => prev.filter((_, i) => i !== index));
        focusField(index - 1);
      }
    },
    [names, focusField]
  );

  const handleNamePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
      const pastedText = e.clipboardData.getData('text');
      if (!pastedText.includes('\n')) return;

      e.preventDefault();
      const lines = pastedText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (lines.length === 0) return;

      const newNames = [...names];
      let lineIndex = 0;
      let cur = index;

      if (newNames[cur].name !== '') {
        newNames.splice(cur + 1, 0, { name: '', amount: '' });
        cur++;
      }

      newNames[cur].name = lines[lineIndex++];
      cur++;

      while (lineIndex < lines.length && cur < newNames.length) {
        if (newNames[cur].name === '') {
          newNames[cur].name = lines[lineIndex++];
          cur++;
        } else {
          break;
        }
      }

      while (lineIndex < lines.length) {
        newNames.splice(cur, 0, { name: lines[lineIndex++], amount: '' });
        cur++;
      }

      setNames(newNames);
      focusField(newNames.length - 1);
    },
    [names, focusField]
  );

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
                <InputGroup width="7rem" flexShrink={0} endElement="kr">
                  <Input
                    placeholder={l.economy.amount}
                    value={member.amount}
                    onChange={(e) => {
                      const newItems = [...groupNames];
                      newItems[index].amount = e.target.value;
                      setGroupNames(newItems);
                    }}
                  />
                </InputGroup>
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
                onPaste={(e) => handleNamePaste(e, index)}
              />
              {trackIndividual && (
                <InputGroup width="6.5rem" flexShrink={0} endElement="kr">
                  <Input
                    placeholder={l.economy.amount}
                    value={nameItem.amount}
                    onChange={(e) => {
                      const newItems = [...names];
                      newItems[index].amount = e.target.value;
                      setNames(newItems);
                    }}
                  />
                </InputGroup>
              )}
              <IconButton
                variant="subtle"
                size="sm"
                flexShrink={0}
                onClick={() =>
                  setNames((prev) => prev.filter((_, i) => i !== index))
                }
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
              focusField(nextIndex);
            }}
          >
            <HiPlus />
            {l.nameLists.addName}
          </Button>

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
