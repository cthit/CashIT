'use client';

import { Button } from '@/components/ui/button';
import { deleteBankAccount } from '@/actions/bankAccounts';
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
  DialogTrigger
} from '@/components/ui/dialog';
import { IconButton } from '@chakra-ui/react';

export default function DeleteAccountButton({
  goCardlessId
}: {
  goCardlessId: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteBankAccount(goCardlessId);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error('Failed to delete bank account:', error);
    } finally {
      setDeleting(false);
    }
  }, [goCardlessId, router]);

  return (
    <DialogRoot open={open} onOpenChange={({ open }) => setOpen(open)}>
      <DialogTrigger asChild>
        <IconButton size="sm" variant="ghost">
          <HiTrash />
        </IconButton>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>
            Are you sure you want to delete this account? This will permanently
            remove:
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>Account transaction history</li>
            <li>Account permissions</li>
          </ul>
          <p style={{ marginTop: '10px' }}>
            Note that you will be able to add this account again in the future,
            at the loss of the above.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <Button colorPalette="red" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
