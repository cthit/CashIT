const apiKey = process.env.GOTIFY_TOKEN;

export default class GotifyService {
  static gotifyUrl = process.env.GOTIFY_ROOT_URL?.replace(/\/$/, '');

  static async sendMessage(
    to: string,
    from: string,
    subject: string,
    body: string
  ) {
    const response = await fetch(this.gotifyUrl + '/mail', {
      method: 'POST',
      headers: {
        Authorization: 'pre-shared: ' + apiKey
      },
      body: JSON.stringify({
        to,
        from,
        subject,
        body
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => response.statusText);
      throw new Error(`Gotify request failed with status ${response.status}`, {
        cause: errorData
      });
    }
  }
}
