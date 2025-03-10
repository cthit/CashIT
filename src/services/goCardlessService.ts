import NodeCache from 'node-cache';
import prisma from '@/prisma';

const secretId = process.env.GOCARDLESS_SECRET_ID;
const secretKey = process.env.GOCARDLESS_SECRET_KEY;
const cache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

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
        `GoCardless request failed with status ${response.status}`,
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
      const errorData = await response.json().catch(() => response.statusText);
      throw new Error(
        `GoCardless request failed with status ${response.status}`,
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
      console.log('Access token expired');

      const newToken = await GoCardlessService.refreshToken(
        cachedToken.res.refresh
      );
      cache.set('gocardless-token', { res: newToken, time: Date.now() / 1000 });

      return newToken;
    }

    return cachedToken.res;
  }

  static async checkToken() {
    await GoCardlessService.getToken();
  }

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
        `GoCardless request failed with status ${response.status}`,
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

  static async registerBankAccount(id: string, requisitionId: string) {
    const response = await fetch(
      this.apiUrl + '/accounts/' + id + '/details/',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + (await this.getToken()).access
        }
      }
    );

    const account = ((await response.json()) as AccountDetails).account;
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
        `GoCardless request failed with status ${response.status}`,
        {
          cause: errorData
        }
      );
    }

    return (await response.json()) as {
      balance: number;
      currency: string;
    };
  }

  static async getRequisitions() {
    const response = await fetch(this.apiUrl + '/requisitions/', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + (await this.getToken()).access
      }
    });

    return (await response.json()) as {
      count: number;
      next: string;
      previous: string;
      results: Requisition[];
    };
  }

  static async registerRequisition(id: string) {
    await prisma.goCardlessRequisition.create({
      data: {
        goCardlessId: id
      }
    });
  }

  static async getRegisteredRequisitions() {
    return await prisma.goCardlessRequisition.findMany();
  }
}
