import { NextRequest, NextResponse } from 'next/server';
import BankAccountService from '@/services/bankAccountService';
import SessionService from '@/services/sessionService';

export async function GET(_request: NextRequest) {
  try {
    const isDivisionTreasurer = await SessionService.isDivisionTreasurer();
    if (!isDivisionTreasurer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await BankAccountService.getAll();
    
    // Return simplified account data for selection purposes
    const simplifiedAccounts = accounts.map(account => ({
      id: account.id,
      name: account.name,
      iban: account.iban,
      goCardlessId: account.goCardlessId
    }));

    return NextResponse.json(simplifiedAccounts);
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank accounts' },
      { status: 500 }
    );
  }
}
