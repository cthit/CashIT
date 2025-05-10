'use client';

import { pdf } from '@react-pdf/renderer';
import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  createListCollection,
  Fieldset,
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
import FileService from '@/services/fileService';
import NameListPdf from '@/components/NameListPdf/NameListPdf';

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
        nick: m.user.firstName + ' ' + m.user.lastName,
        amount:
          nl.gammaNames
            .find((n) => n.gammaUserId === m.user.id)
            ?.cost.toString() ?? ''
      }))
    : sg?.members.map((m) => ({
        id: m.user.id,
        nick: m.user.firstName + ' ' + m.user.lastName,
        amount: ''
      })) ?? [];
};

export default function CreateNameListForm({
  superGroups,
  nl,
  groups,
  locale
}: {
  superGroups: { members: GammaGroupMember[]; superGroup: GammaSuperGroup }[];
  nl?: Awaited<ReturnType<typeof NameListService.getById>>;
  groups: GammaGroup[];
  locale: string;
}) {
  const l = i18nService.getLocale(locale);

  const groupOptions = createListCollection({
    items: [{ label: l.group.noGroup, value: '' }].concat(
      groups.map((group) => ({
        label: group.prettyName,
        value: group.id
      }))
    )
  });

  const router = useRouter();

  const superGroupsReverse = useMemo(
    () =>
      superGroups.reduce((acc, group) => {
        acc[group.superGroup.id] = group;
        return acc;
      }, {} as Record<string, { members: GammaGroupMember[] }>),
    [superGroups]
  );

  const groupToSuperGroup = useMemo(
    () =>
      groups.reduce((acc, group) => {
        acc[group.id] = group.superGroup.id;
        return acc;
      }, {} as Record<string, string>),
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
    nl?.names.length ?? 0 > 0 ? 'custom' : 'members'
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
            (groupId === '' ? null : groupId) ?? nl.gammaGroupId,
            name,
            type,
            customNames,
            gammaNames,
            trackIndividual,
            new Date(date)
          ).then(() => router.push('/name-lists'))
        : groupId !== '' && groupId !== undefined
        ? createNameListForGroup(
            groupId,
            name,
            type,
            customNames,
            gammaNames,
            trackIndividual,
            new Date(date)
          ).then(() => router.push('/name-lists'))
        : createPersonalNameList(
            name,
            type,
            customNames,
            gammaNames,
            trackIndividual,
            new Date(date)
          ).then(() => router.push('/name-lists'));
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
      type
    ]
  );

  const exportPdf = useCallback(async () => {
    if (!nl) return;

    const gammaNames = groupNames
      .map((n) => ({ nick: n.nick, amount: +n.amount }))
      .filter((n) => n.amount > 0);

    const blob = await pdf(
      <NameListPdf gammaNames={gammaNames} nl={nl} locale={locale} />
    ).toBlob();
    FileService.saveToFile(
      `name-list-${nl.id}-${new Date().getTime()}.pdf`,
      blob
    );
  }, [groupNames, locale, nl]);

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

  return (
    <form onSubmit={createList}>
      <Heading>{nl ? l.nameLists.edit : l.nameLists.create}</Heading>
      <Box p="1.5" />
      {nl && (
        <Button variant="surface" type="button" onClick={exportPdf}>
          {l.general.download}
        </Button>
      )}
      <Box p="2.5" />
      <Fieldset.Root width={400}>
        <Fieldset.Content>
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

          <Field label={l.general.description} required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field label={l.expense.type} required>
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

          <Field label={l.nameLists.format} required>
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

          <Field label={l.economy.date} required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>

          <Field label={l.general.comment}>
            <Textarea />
          </Field>

          <Box p="2" />
        </Fieldset.Content>
      </Fieldset.Root>

      <Fieldset.Root maxW="md" size="lg" hidden={nameSource !== 'members'}>
        <Fieldset.Legend>{l.nameLists.names}</Fieldset.Legend>
        <Fieldset.Content mt="0.25rem">
          <Separator />

          {groupNames.map((member, index) => (
            <Field label={member.nick} key={member.id}>
              {trackIndividual ? (
                <Input
                  type="number"
                  value={member.amount}
                  onChange={(e) => {
                    const newItems = [...groupNames];
                    newItems[index].amount = e.target.value;
                    setGroupNames(newItems);
                  }}
                />
              ) : (
                <Switch
                  checked={+groupNames[index].amount > 0}
                  onChange={() => {
                    const newItems = [...groupNames];
                    newItems[index].amount =
                      +groupNames[index].amount > 0 ? '0' : '1';
                    setGroupNames(newItems);
                  }}
                />
              )}
            </Field>
          ))}

          {groupNames.length === 0 && (
            <Text>{l.nameLists.membersNotFound}</Text>
          )}

          <Field>
            <Button variant="surface" type="submit">
              {l.economy.submit}
            </Button>
            {nl && (
              <Button variant="surface" type="button" onClick={exportPdf}>
                Download
              </Button>
            )}
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>

      <Fieldset.Root maxW="md" size="lg" hidden={nameSource !== 'custom'}>
        <Fieldset.Legend>
          {l.nameLists.names}{' '}
          <IconButton
            variant="subtle"
            size="sm"
            onClick={() => setNames([...names, { name: '', amount: '' }])}
          >
            <HiPlus />
          </IconButton>
        </Fieldset.Legend>
        <Fieldset.Content mt="0.25rem">
          <Separator />
          {names.map((name, index) => (
            <Field key={index}>
              <Input
                placeholder="Name"
                value={name.name}
                onChange={(e) => {
                  const newItems = [...names];
                  newItems[index].name = e.target.value;
                  setNames(newItems);
                }}
              />
              {trackIndividual && (
                <Input
                  placeholder="Amount"
                  value={name.amount}
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
                onClick={() => {
                  const newItems = [...names];
                  newItems.splice(index, 1);
                  setNames(newItems);
                }}
              >
                <HiTrash />
              </IconButton>
            </Field>
          ))}
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
