'use server';

import OrgService from '@/services/orgService';
import { revalidatePath } from 'next/cache';

export async function createOrganization(name: string) {
  const organization = await OrgService.create(name);
  revalidatePath('/admin/organizations');
  return organization;
}

export async function updateOrganization(id: number, name: string) {
  const organization = await OrgService.update(id, name);
  revalidatePath('/admin/organizations');
  revalidatePath(`/admin/organizations/${id}`);
  return organization;
}

export async function deleteOrganization(id: number) {
  await OrgService.delete(id);
  revalidatePath('/admin/organizations');
}
