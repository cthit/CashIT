'use server';

import BankAccountService from "@/services/bankAccountService";

export async function refreshAllBankAccounts() {
    return await BankAccountService.refreshAll();
}
