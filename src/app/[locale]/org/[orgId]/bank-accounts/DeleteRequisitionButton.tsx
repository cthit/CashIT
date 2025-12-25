'use client';

import { Button } from '@/components/ui/button';
import { deleteRequisition } from '@/actions/bankAccounts';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiTrash } from 'react-icons/hi';
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import i18nService from '@/services/i18nService';

export default function DeleteRequisitionButton({ 
  requisitionId,
  accountCount,
  locale
}: { 
  requisitionId: string;
  accountCount: number;
  locale: string;
}) {
  const l = i18nService.getLocale(locale);
  const d = l.dialogs;

  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteRequisition(requisitionId);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error('Failed to delete requisition:', error);
    } finally {
      setDeleting(false);
    }
  }, [requisitionId, router]);

  return (
    <DialogRoot open={open} onOpenChange={({ open }) => setOpen(open)}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <HiTrash />
          {l.general.delete}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{d.deleteConnectionTitle}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>{d.deleteConnectionConfirm}</p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>{d.deleteConnectionConnection}</li>
            <li>{accountCount} {d.deleteConnectionBankAccounts.replace('{count}', accountCount !== 1 ? 's' : '')}</li>
            <li>{d.deleteConnectionTransactions}</li>
            <li>{d.deleteConnectionPermissions}</li>
          </ul>
          <p style={{ marginTop: '10px', fontWeight: 'bold', color: 'red' }}>
            {d.deleteConnectionWarning}
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">{d.cancel}</Button>
          </DialogActionTrigger>
          <Button 
            colorPalette="red" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? d.deleting : d.deleteConnectionTitle}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
