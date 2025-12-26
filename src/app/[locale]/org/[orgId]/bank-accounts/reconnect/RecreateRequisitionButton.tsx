'use client';


import { recreateRequisition } from '@/actions/goCardless';
import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import i18nService from '@/services/i18nService';


const RecreateRequisitionButton = ({
  id,
  orgId,
  locale
}: {
  id: string;
  orgId: string;
  locale: string;
}) => {
  const l = i18nService.getLocale(locale);
  const router = useRouter();
  const handleClick = async () => {
    const req = await recreateRequisition(id, orgId);
    router.push(req.link);
  };

  return <Button onClick={handleClick}>{l.bankConnections.reconnect}</Button>;
};

export default RecreateRequisitionButton;
