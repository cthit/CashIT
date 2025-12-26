'use client';

import NameListPdf from '@/components/NameListPdf/NameListPdf';
import FileService from '@/services/fileService';
import i18nService from '@/services/i18nService';
import NameListService from '@/services/nameListService';
import { GammaGroup, GammaGroupMember, GammaSuperGroup } from '@/types/gamma';
import { Button } from '@chakra-ui/react';
import { pdf } from '@react-pdf/renderer';
import { useCallback, useMemo } from 'react';

export default function DownloadNameListButton({
  superGroups,
  nl,
  groups,
  locale
}: {
  superGroups: { members: GammaGroupMember[]; superGroup: GammaSuperGroup }[];
  nl: NonNullable<Awaited<ReturnType<typeof NameListService.getById>>>;
  groups: GammaGroup[];
  locale: string;
}) {
  const l = i18nService.getLocale(locale);

  const groupNames = useMemo(() => {
    const groupToSgId = groups.find((g) => g.id === nl.gammaGroupId)?.superGroup
      .id;
    const sg = superGroups.find((sg) => sg.superGroup.id === groupToSgId);

    return (
      sg?.members.map((m) => ({
        nameNick: `${m.user.firstName} "${m.user.nick}" ${m.user.lastName}`,
        fullName: `${m.user.firstName} ${m.user.lastName}`,
        amount:
          nl.gammaNames.find((n) => n.gammaUserId === m.user.id)?.cost ?? 0
      })) ?? []
    );
  }, [superGroups, groups, nl]);

  const exportPdf = useCallback(async () => {
    const gammaNames = groupNames.filter((n) => n.amount > 0);
    const blob = await pdf(
      <NameListPdf gammaNames={gammaNames} nl={nl} locale={locale} />
    ).toBlob();
    FileService.saveToFile(`name-list-${nl.id}-${Date.now()}.pdf`, blob);
  }, [groupNames, locale, nl]);

  return (
    <Button variant="surface" type="button" onClick={exportPdf}>
      {l.general.download}
    </Button>
  );
}
