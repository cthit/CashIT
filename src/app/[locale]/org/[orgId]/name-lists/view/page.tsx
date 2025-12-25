import { notFound } from 'next/navigation';
import { Box, Fieldset, Heading, Text } from '@chakra-ui/react';
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
  BreadcrumbRoot
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import NameListService from '@/services/nameListService';
import SessionService from '@/services/sessionService';
import GammaService from '@/services/gammaService';
import { Button } from '@/components/ui/button';
import OrgService from '@/services/orgService';
import i18nService from '@/services/i18nService';
import { Field } from '@/components/ui/field';
import { NameListType } from '@prisma/client';
import { GammaGroupMember } from '@/types/gamma';
import DownloadNameListButton from './DownloadNameListButton';

export default async function Page(props: {
  searchParams: Promise<{ id?: string }>;
  params: Promise<{ locale: string; orgId: string }>;
}) {
  const { locale, orgId } = await props.params;
  const l = i18nService.getLocale(locale);

  const { id } = await props.searchParams;
  if (id === undefined) {
    notFound();
  }

  const nameList = await NameListService.getById(+id);
  if (nameList === null) notFound();
  const personal = nameList === null || nameList.gammaGroupId === null;
  const divisionTreasurer = await SessionService.isDivisionTreasurer();

  const group = !personal
    ? (await SessionService.getGroups()).find(
        (g) => g.group.id === nameList.gammaGroupId
      )?.group
    : undefined;

  if (!personal && !divisionTreasurer && group === undefined) {
    notFound();
  }

  const sg =
    personal || group === undefined
      ? undefined
      : await GammaService.getSuperGroup(group.superGroup.id);
  if (!personal && !divisionTreasurer && sg === undefined) {
    notFound();
  }

  const groups = (await SessionService.getGroups()).map((g) => g.group);
  const superGroups = await GammaService.getAllSuperGroups();

  const org = await OrgService.getById(+orgId);
  if (!org) {
    notFound();
  }

  const user = (await SessionService.getGammaUser())?.user;
  const canEdit =
    divisionTreasurer ||
    group !== undefined ||
    user?.id === nameList.gammaUserId;

  const selectedGroup = nameList.gammaGroupId
    ? groups.find((g) => g.id === nameList.gammaGroupId)
    : null;

  const typeLabels = {
    [NameListType.EVENT]: l.nameLists.types.event,
    [NameListType.WORK_FOOD]: l.nameLists.types.workFood,
    [NameListType.TEAMBUILDING]: l.nameLists.types.teambuilding,
    [NameListType.PROFILE_CLOTHING]: l.nameLists.types.profileClothing
  };

  const superGroupsReverse = superGroups.reduce((acc, group) => {
    acc[group.superGroup.id] = group;
    return acc;
  }, {} as Record<string, { members: GammaGroupMember[] }>);

  const isMembers = nameList.gammaNames.length > 0;
  let displayNames: { name: string; amount: string }[] = [];

  if (isMembers) {
    const group = groups.find(g => g.id === nameList.gammaGroupId);
    const superGroupId = group?.superGroup.id;
    const sg = superGroupsReverse[superGroupId ?? ''];
    const members = sg ? sg.members : [];
    displayNames = nameList.gammaNames.map(gn => {
      const member = members.find(m => m.user.id === gn.gammaUserId);
      return {
        name: member ? `${member.user.firstName} "${member.user.nick}" ${member.user.lastName}` : 'Unknown',
        amount: gn.cost.toString()
      };
    });
  } else {
    displayNames = nameList.names.map(n => ({
      name: n.name,
      amount: n.cost.toString()
    }));
  }

  return (
    <>
      <BreadcrumbRoot>
        <BreadcrumbLink as={Link} href={`/org/${orgId}`}>
          {l.home.title}
        </BreadcrumbLink>
        <BreadcrumbLink as={Link} href={`/org/${orgId}/name-lists`}>
          {l.nameLists.list}
        </BreadcrumbLink>
        <BreadcrumbCurrentLink>{l.general.view}</BreadcrumbCurrentLink>
      </BreadcrumbRoot>
      <Box p="4" />
      {canEdit && (
        <Box mb="4">
          <Button asChild colorPalette="cyan">
            <Link href={`/org/${orgId}/name-lists/edit?id=${id}`}>
              {l.general.edit}
            </Link>
          </Button>
          <DownloadNameListButton
            nl={nameList}
            locale={locale}
            superGroups={superGroups}
            groups={groups}
          />
        </Box>
      )}
      <Fieldset.Root>
        <Fieldset.Legend>
          <Heading size="lg">{l.nameLists.nameList}</Heading>
        </Fieldset.Legend>
        <Fieldset.Content mt="0.25rem">
          <Field label={l.group.group}>
            <Text>
              {selectedGroup ? selectedGroup.prettyName : l.group.personal}
            </Text>
          </Field>

          <Field label={l.general.description}>
            <Text>{nameList.name}</Text>
          </Field>

          <Field label={l.nameLists.type}>
            <Text>{typeLabels[nameList.type]}</Text>
          </Field>

          <Field label={l.economy.date}>
            <Text>{nameList.occurredAt.toLocaleDateString(locale)}</Text>
          </Field>

          <Field label={l.nameLists.tracked}>
            <Text>{nameList.tracked ? l.general.yes : l.general.no}</Text>
          </Field>
        </Fieldset.Content>
      </Fieldset.Root>

      <Fieldset.Root maxW="md" size="lg" mt="4">
        <Fieldset.Legend>{l.nameLists.names}</Fieldset.Legend>
        <Fieldset.Content mt="0.25rem">
          {displayNames.map((item, index) => (
            <Field label={item.name} key={index}>
              <Text>{nameList.tracked ? item.amount : ''}</Text>
            </Field>
          ))}
          {displayNames.length === 0 && (
            <Text>No names found</Text>
          )}
        </Fieldset.Content>
      </Fieldset.Root>
    </>
  );
}
