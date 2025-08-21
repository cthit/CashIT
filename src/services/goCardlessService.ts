import prisma from '@/prisma';
import cache from '@/cache';

const secretId = process.env.GOCARDLESS_SECRET_ID;
const secretKey = process.env.GOCARDLESS_SECRET_KEY;

interface RequisitionRequest {
  redirect: string;
  institution_id: string;
  reference: string;
  agreement?: string;
  user_language?: string;
  ssn?: string;
  account_selection?: boolean;
  redirect_immediate?: boolean;
}

interface AccessToken {
  access: string;
  access_expires: number;
  refresh: string;
  refresh_expires: number;
}

export interface Requisition {
  id: string;
  created: string;
  redirect: string;
  status: string;
  institution_id: string;
  reference: string;
  accounts: string[];
  link: string;
  ssn?: string;
  account_selection: boolean;
  redirect_immediate: boolean;
}

interface AccountDetails {
  account: {
    resourceId: string;
    iban: string;
    currency: string;
    ownerName: string;
    name?: string;
    product: string;
    cashAccountType: string;
  };
}

interface AccountTransaction {
  transactionId?: string;
  creditorName?: string;
  creditorAccount?: {
    iban?: string;
  };
  transactionAmount: {
    amount: string;
    currency: string;
  };
  bookingDate?: string;
  valueDate?: string;
  remittanceInformationUnstructured?: string;
  remittanceInformationUnstructuredArray?: string[];
  remittanceInformationStructured?: string;
  remittanceInformationStructuredArray?: string[];
  internalTransactionId?: string;
  additionalInformation?: string;
}

export default class GoCardlessService {
  static apiUrl = 'https://bankaccountdata.gocardless.com/api/v2';

  private static async newToken() {
    const response = await fetch(this.apiUrl + '/token/new/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secret_id: secretId,
        secret_key: secretKey
      })
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .then((j) => JSON.stringify(j))
        .catch(() => response.statusText);
      throw new Error(
        `GoCardless token creation request failed with status ${response.status}`,
        {
          cause: errorData
        }
      );
    }

    return (await response.json()) as AccessToken;
  }

  private static async refreshToken(refreshToken: string) {
    const response = await fetch(this.apiUrl + '/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh: refreshToken
      })
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .then((j) => JSON.stringify(j))
        .catch(() => response.statusText);
      throw new Error(
        `GoCardless token refresh request failed with status ${response.status}`,
        {
          cause: errorData
        }
      );
    }

    return (await response.json()) as {
      access: string;
      access_expires: number;
    };
  }

  private static async getToken() {
    const cachedToken = cache.get('gocardless-token') as
      | { res: AccessToken; time: number }
      | undefined;

    if (
      cachedToken === undefined ||
      cachedToken.time + cachedToken.res.refresh_expires - 60 <
        Date.now() / 1000
    ) {
      console.log('No token or refresh token expired');
      const newToken = await GoCardlessService.newToken();
      cache.set('gocardless-token', { res: newToken, time: Date.now() / 1000 });

      return newToken;
    }

    if (
      cachedToken.time + cachedToken.res.access_expires - 60 <
      Date.now() / 1000
    ) {
      console.log('Access token expired, will refresh');

      const newAccess = await GoCardlessService.refreshToken(
        cachedToken.res.refresh
      );

      const newToken: AccessToken = {
        access: newAccess.access,
        access_expires: newAccess.access_expires,
        refresh: cachedToken.res.refresh,
        refresh_expires: cachedToken.res.refresh_expires
      };
      cache.set('gocardless-token', { res: newToken, time: Date.now() / 1000 });

      return newToken;
    }

    return cachedToken.res;
  }

  static async checkToken() {
    await GoCardlessService.getToken();
  }

  /**
   * Gets account balance from GoCardless API
   * @param id GoCardless bank account ID
   * @returns Balances for the given account
   */
  static async getBankAccountBalance(id: string) {
    const response = await fetch(
      this.apiUrl + '/accounts/' + id + '/balances/',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + (await this.getToken()).access,
          accept: 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .then((j) => JSON.stringify(j))
        .catch(() => response.statusText);
      throw new Error(
        `GoCardless account balance request for ID ${id} failed with status ${response.status}`,
        {
          cause: errorData
        }
      );
    }

    return (await response.json()).balances as {
      balanceAmount: {
        amount: string;
        currency: string;
      };
      balanceType: 'interimAvailable' | 'interimBooked';
    }[];
  }

  /**
   * Gets account transaction history from GoCardless API
   * @param id GoCardless bank account ID
   * @returns Transaction history for the given account
   */
  static async getBankAccountTransactions(id: string) {
    const response = await fetch(
      this.apiUrl + '/accounts/' + id + '/transactions/',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + (await this.getToken()).access,
          accept: 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .then((j) => JSON.stringify(j))
        .catch(() => response.statusText);
      throw new Error(
        `GoCardless account transaction history request for ID ${id} failed with status ${response.status}`,
        {
          cause: errorData
        }
      );
    }

    return (await response.json()).transactions as {
      booked: AccountTransaction[];
      pending: AccountTransaction[];
    };
  }

  /**
   * Gets account details from GoCardless API
   * @param id GoCardless bank account ID
   * @returns Account details for the given account
   */
  static async getBankAccountDetails(id: string) {
    const response = await fetch(
      this.apiUrl + '/accounts/' + id + '/details/',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + (await this.getToken()).access
        }
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .then((j) => JSON.stringify(j))
        .catch(() => response.statusText);
      throw new Error(
        `GoCardless account details request for ID ${id} failed with status ${response.status}`,
        {
          cause: errorData
        }
      );
    }

    return (await response.json()) as AccountDetails;
  }

  /**
   * Register GoCardless bank account in local database
   * @param id GoCardless bank account ID
   * @param requisitionId GoCardless requisition ID
   */
  static async registerBankAccount(id: string, requisitionId: string) {
    const account = (await this.getBankAccountDetails(id)).account;

    await prisma.bankAccount.create({
      data: {
        name: account.name ?? account.product,
        goCardlessId: id,
        iban: account.iban,
        balanceAvailable: 0,
        balanceBooked: 0,
        requisition: {
          connect: {
            goCardlessId: requisitionId
          }
        }
      }
    });
  }

  /**
   * Create GoCardless requisition
   * @param r GoCardless requisition request
   * @returns Created GoCardless requisition
   */
  static async createRequisition(r: RequisitionRequest) {
    const response = await fetch(this.apiUrl + '/requisitions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (await this.getToken()).access
      },
      body: JSON.stringify(r)
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .then((j) => JSON.stringify(j))
        .catch(() => response.statusText);
      throw new Error(
        `GoCardless requisition creation request failed with status ${response.status}`,
        {
          cause: errorData
        }
      );
    }

    return (await response.json()) as Requisition;
  }

  /**
   * Gets requisition list from GoCardless API. Limited to 100 results per request.
   * @returns Requisition list for the given account
   */
  static async getRequisitions() {
    const response = await fetch(this.apiUrl + '/requisitions/', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + (await this.getToken()).access
      }
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .then((j) => JSON.stringify(j))
        .catch(() => response.statusText);
      throw new Error(
        `GoCardless requisition list request failed with status ${response.status}`,
        {
          cause: errorData
        }
      );
    }

    return (await response.json()) as {
      count: number; // Total number of requisitions
      next: string; // URL for next page
      previous: string; // URL for previous page
      results: Requisition[];
    };
  }

  /**
   * Registers a GoCardless requisition in the local database
   * @param id GoCardless requisition ID
   */
  static async registerRequisition(id: string) {
    await prisma.goCardlessRequisition.create({
      data: {
        goCardlessId: id
      }
    });
  }

  /**
   * Gets local GoCardless requisitions and their locally registered bank accounts
   * @returns List of GoCardless requisitions
   */
  static async getRegisteredRequisitions() {
    return await prisma.goCardlessRequisition.findMany({
      include: {
        bankAccounts: true
      }
    });
  }
}
