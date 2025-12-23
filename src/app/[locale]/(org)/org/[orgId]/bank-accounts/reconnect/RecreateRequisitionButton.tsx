'use client';

import { recreateRequisition } from "@/actions/goCardless";
import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const RecreateRequisitionButton = ({id}: { id: string }) => {
  const router = useRouter();
  const handleClick = async () => {
    const req = await recreateRequisition(id);
    router.push(req.link);
  };

  return (
    <Button onClick={handleClick}>
      Recreate Requisition
    </Button>
  );
};

export default RecreateRequisitionButton;
