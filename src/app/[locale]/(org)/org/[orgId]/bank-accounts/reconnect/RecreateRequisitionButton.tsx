'use client';

import { recreateRequisition } from '@/actions/goCardless';
import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

const RecreateRequisitionButton = ({
  id,
  orgId
}: {
  id: string;
  orgId: string;
}) => {
  const router = useRouter();
  const handleClick = async () => {
    const req = await recreateRequisition(id, orgId);
    router.push(req.link);
  };

  return <Button onClick={handleClick}>Recreate Requisition</Button>;
};

export default RecreateRequisitionButton;
