'use client';

import { Button } from '@/components/ui/button';
import i18nService from '@/services/i18nService';
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
  goCardlessId,
  locale
}: {
  goCardlessId: string;
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
          <DialogTitle>{d.deleteAccountTitle}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p>{d.deleteAccountConfirm}</p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>{d.deleteAccountTransactions}</li>
            <li>{d.deleteAccountPermissions}</li>
          </ul>
          <p style={{ marginTop: '10px' }}>
            {d.deleteAccountNote}
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">{d.cancel}</Button>
          </DialogActionTrigger>
          <Button colorPalette="red" onClick={handleDelete} disabled={deleting}>
            {deleting ? d.deleting : d.deleteAccountTitle}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
}
