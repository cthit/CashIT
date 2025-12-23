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

export default function DeleteRequisitionButton({ 
  requisitionId,
  accountCount
}: { 
  requisitionId: string;
  accountCount: number;
}) {
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
          Delete
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Bank Connection</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>
            Are you sure you want to delete this bank connection? This will permanently remove:
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>The connection itself</li>
            <li>{accountCount} bank account{accountCount !== 1 ? 's' : ''}</li>
            <li>All transaction history</li>
            <li>All permission settings</li>
          </ul>
          <p style={{ marginTop: '10px', fontWeight: 'bold', color: 'red' }}>
            This action cannot be undone.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <Button 
            colorPalette="red" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Connection'}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
