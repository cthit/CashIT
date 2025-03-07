import NodeCache from 'node-cache';

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
    /*const tokenCache = unstable_cache(
      async (oldToken?: AccessToken) => {
        console.log('Refreshing token');
        const requestAt = Date.now() / 1000;

        return {
          res: oldToken
            ? {
                ...(await this.refreshToken(oldToken.refresh)),
                refresh: oldToken.refresh,
                refresh_expires: oldToken.refresh_expires
              }
            : await this.newToken(),
          time: requestAt
        };
      },
      ['gocardless-token'],
      { tags: ['gocardless-token'], revalidate: false }
    );*/

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
}
